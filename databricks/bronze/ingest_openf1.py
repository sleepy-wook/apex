# Databricks notebook source
# =============================================================================
# Bronze — OpenF1 API 수집
# =============================================================================
# OpenF1 API에서 데이터를 가져와 S3에 Delta Table로 저장합니다.
# API 원본 데이터를 변환 없이 그대로 저장하는 것이 Bronze 레이어의 원칙입니다.
#
# 실행 방법 (Databricks 노트북):
#   셀 1: %run ../config
#   셀 2: %run ./ingest_openf1
#   셀 3: ingest_all(2025)
#
# 참고: schemas.json의 openf1 섹션에서 각 엔드포인트 스키마 확인
# =============================================================================

import requests
import time
import json
from pyspark.sql import SparkSession
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType,
    DoubleType, BooleanType, ArrayType, LongType
)

spark = SparkSession.builder.getOrCreate()


# -----------------------------------------------------------------------------
# 1. API 호출 유틸리티
# -----------------------------------------------------------------------------
def fetch_openf1(endpoint_url, params=None):
    """
    OpenF1 API 호출 후 JSON 리스트 반환.
    빈 응답이면 빈 리스트, 에러 시 빈 리스트 + 경고 출력.
    """
    try:
        response = requests.get(endpoint_url, params=params, timeout=30)
        response.raise_for_status()
        time.sleep(OPENF1.RATE_LIMIT_DELAY)
        data = response.json()
        return data if isinstance(data, list) else []
    except requests.exceptions.RequestException as e:
        print(f"[WARN] OpenF1 API 호출 실패: {endpoint_url} params={params} → {e}")
        return []


# -----------------------------------------------------------------------------
# 2. DataFrame 변환 & 저장 유틸리티
# -----------------------------------------------------------------------------
def save_to_bronze(data, table_name, partition_cols=None):
    """
    JSON 리스트 → Spark DataFrame → Delta Table 저장.
    segments_sector_* 배열은 JSON string으로 변환하여 호환성 보장.
    """
    if not data:
        print(f"[SKIP] {table_name}: 데이터 없음")
        return

    # segments 배열을 JSON string으로 변환 (Spark 스키마 추론 문제 방지)
    for row in data:
        for key in ["segments_sector_1", "segments_sector_2", "segments_sector_3"]:
            if key in row and isinstance(row[key], list):
                row[key] = json.dumps(row[key])

    df = spark.createDataFrame(data)
    path = f"{S3.BRONZE_PATH}/{table_name}"

    writer = df.write.format("delta").mode("overwrite")
    if partition_cols:
        writer = writer.partitionBy(*partition_cols)
    writer.save(path)

    # Unity Catalog 등록
    spark.sql(f"""
        CREATE TABLE IF NOT EXISTS {table(table_name)}
        USING DELTA LOCATION '{path}'
    """)

    print(f"[OK] {table_name}: {df.count()}행 저장 → {path}")


# -----------------------------------------------------------------------------
# 3. 세션 목록 수집
# -----------------------------------------------------------------------------
def ingest_sessions(year):
    """해당 연도의 모든 세션 수집."""
    print(f"\n{'='*60}")
    print(f"[Sessions] {year}년 세션 수집 시작")
    print(f"{'='*60}")

    data = fetch_openf1(OPENF1.SESSIONS, {"year": year})
    save_to_bronze(data, TABLES.BRONZE_SESSIONS, partition_cols=["year"])
    return data


# -----------------------------------------------------------------------------
# 4. 드라이버 수집
# -----------------------------------------------------------------------------
def ingest_drivers(year, session_keys):
    """
    해당 연도의 모든 세션에서 드라이버 정보 수집.
    세션별로 호출 후 합쳐서 저장 (대체 드라이버 등 세션마다 다를 수 있음).
    """
    print(f"\n{'='*60}")
    print(f"[Drivers] {year}년 드라이버 수집 시작 ({len(session_keys)}개 세션)")
    print(f"{'='*60}")

    all_data = []
    for sk in session_keys:
        drivers = fetch_openf1(OPENF1.DRIVERS, {"session_key": sk})
        # year 필드 추가 (파티셔닝용)
        for d in drivers:
            d["year"] = year
        all_data.extend(drivers)
        print(f"  세션 {sk}: {len(drivers)}명")

    # session_key + driver_number 기준 중복 제거 (마지막 값 유지)
    seen = {}
    for row in all_data:
        key = (row.get("session_key"), row.get("driver_number"))
        seen[key] = row
    deduped = list(seen.values())

    save_to_bronze(deduped, TABLES.BRONZE_DRIVERS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 5. 세션별 데이터 수집 함수들
# -----------------------------------------------------------------------------
def ingest_laps(year, session_key):
    """특정 세션의 전체 랩 타임 수집."""
    data = fetch_openf1(OPENF1.LAPS, {"session_key": session_key})
    for row in data:
        row["year"] = year
    save_to_bronze(data, TABLES.BRONZE_LAPS, partition_cols=["year", "session_key"])
    return len(data)


def ingest_pit(year, session_key):
    """특정 세션의 피트스탑 데이터 수집."""
    data = fetch_openf1(OPENF1.PIT, {"session_key": session_key})
    for row in data:
        row["year"] = year
    save_to_bronze(data, TABLES.BRONZE_PIT, partition_cols=["year", "session_key"])
    return len(data)


def ingest_stints(year, session_key):
    """특정 세션의 타이어 스틴트 데이터 수집."""
    data = fetch_openf1(OPENF1.STINTS, {"session_key": session_key})
    for row in data:
        row["year"] = year
    save_to_bronze(data, TABLES.BRONZE_STINTS, partition_cols=["year", "session_key"])
    return len(data)


def ingest_position(year, session_key):
    """특정 세션의 실시간 포지션 변화 수집."""
    data = fetch_openf1(OPENF1.POSITION, {"session_key": session_key})
    for row in data:
        row["year"] = year
    save_to_bronze(data, TABLES.BRONZE_POSITION, partition_cols=["year", "session_key"])
    return len(data)


def ingest_race_control(year, session_key):
    """특정 세션의 레이스 컨트롤 메시지 수집."""
    data = fetch_openf1(OPENF1.RACE_CONTROL, {"session_key": session_key})
    for row in data:
        row["year"] = year
    save_to_bronze(data, TABLES.BRONZE_RACE_CONTROL, partition_cols=["year", "session_key"])
    return len(data)


# -----------------------------------------------------------------------------
# 6. 단일 세션 수집
# -----------------------------------------------------------------------------
def ingest_session_data(year, session_key, session_name=""):
    """하나의 세션에 대해 모든 데이터를 수집."""
    print(f"\n  --- 세션 {session_key} ({session_name}) ---")

    results = {}
    collectors = [
        ("laps", ingest_laps),
        ("pit", ingest_pit),
        ("stints", ingest_stints),
        ("position", ingest_position),
        ("race_control", ingest_race_control),
    ]

    for name, func in collectors:
        try:
            count = func(year, session_key)
            results[name] = count
            print(f"    {name}: {count}행")
        except Exception as e:
            print(f"    [ERROR] {name}: {e}")
            results[name] = -1

    return results


# -----------------------------------------------------------------------------
# 7. 메인 수집 오케스트레이터
# -----------------------------------------------------------------------------
def ingest_all(year, session_types=None):
    """
    해당 연도의 OpenF1 데이터를 전부 수집.

    Args:
        year: 수집 연도 (2023, 2024, 2025)
        session_types: 수집할 세션 타입 리스트 (기본: Race, Qualifying, Sprint)
    """
    if session_types is None:
        session_types = ["Race", "Qualifying", "Sprint"]

    print(f"\n{'#'*60}")
    print(f"# OpenF1 Bronze 수집 시작: {year}년")
    print(f"# 대상 세션 타입: {session_types}")
    print(f"{'#'*60}")

    # 1) 세션 목록 수집
    sessions = ingest_sessions(year)
    if not sessions:
        print(f"[ERROR] {year}년 세션 데이터 없음. 종료.")
        return

    # 2) 세션 타입 필터링
    target_sessions = [
        s for s in sessions
        if s.get("session_type") in session_types
    ]
    print(f"\n전체 세션 {len(sessions)}개 중 대상 {len(target_sessions)}개")

    # 3) 세션 키 목록 (드라이버 수집용)
    all_session_keys = [s["session_key"] for s in sessions]

    # 4) 드라이버 수집 (전체 세션 대상)
    ingest_drivers(year, all_session_keys)

    # 5) 세션별 데이터 수집
    print(f"\n{'='*60}")
    print(f"[세션별 데이터] {len(target_sessions)}개 세션 수집 시작")
    print(f"{'='*60}")

    for i, session in enumerate(target_sessions, 1):
        sk = session["session_key"]
        sname = f"{session.get('circuit_short_name', '?')} {session.get('session_name', '?')}"
        print(f"\n[{i}/{len(target_sessions)}] {sname}")

        try:
            ingest_session_data(year, sk, sname)
        except Exception as e:
            print(f"  [ERROR] 세션 {sk} 전체 실패: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# OpenF1 Bronze 수집 완료: {year}년")
    print(f"{'#'*60}")
