# Databricks notebook source
# =============================================================================
# Bronze — Jolpica-F1 API 수집 (Ergast 후속, 1950+)
# =============================================================================
# 레이스 결과, 챔피언십 스탠딩 등 역사 데이터를 수집합니다.
# Jolpica의 모든 숫자 필드는 String으로 옵니다 — Bronze에서는 그대로 저장,
# Silver에서 타입 캐스팅합니다.
#
# 실행 방법 (Databricks 노트북):
#   셀 1: %run ../config
#   셀 2: %run ./ingest_jolpica
#   셀 3: ingest_all(2025)
#
# 참고: schemas.json의 jolpica 섹션에서 각 엔드포인트 스키마 확인
# =============================================================================

import requests
import time
import json
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()


# -----------------------------------------------------------------------------
# 1. API 호출 유틸리티
# -----------------------------------------------------------------------------
def fetch_jolpica(endpoint_path, limit=None):
    """
    Jolpica API 호출 후 원본 MRData 반환.
    페이지네이션은 limit/offset으로 처리.
    """
    url = f"{JOLPICA.BASE_URL}/{endpoint_path}"
    params = {"limit": limit or JOLPICA.DEFAULT_LIMIT, "offset": 0}

    all_data = []
    while True:
        try:
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            mr_data = response.json().get("MRData", {})

            total = int(mr_data.get("total", 0))
            offset = int(mr_data.get("offset", 0))
            limit_val = int(mr_data.get("limit", 100))

            all_data.append(mr_data)

            # 다음 페이지 필요 여부
            if offset + limit_val >= total:
                break
            params["offset"] = offset + limit_val
            time.sleep(0.5)  # rate limit 대비

        except requests.exceptions.RequestException as e:
            print(f"[WARN] Jolpica API 호출 실패: {url} → {e}")
            break

    return all_data


def extract_races(mr_data_list):
    """MRData 리스트에서 RaceTable.Races 추출."""
    races = []
    for mr in mr_data_list:
        race_table = mr.get("RaceTable", {})
        races.extend(race_table.get("Races", []))
    return races


def extract_standings(mr_data_list, standings_key):
    """
    MRData 리스트에서 StandingsTable.StandingsLists[].{standings_key} 추출.
    standings_key: "DriverStandings" 또는 "ConstructorStandings"
    """
    items = []
    for mr in mr_data_list:
        standings_table = mr.get("StandingsTable", {})
        for sl in standings_table.get("StandingsLists", []):
            season = sl.get("season", "")
            round_num = sl.get("round", "")
            for entry in sl.get(standings_key, []):
                entry["_season"] = season
                entry["_round"] = round_num
                items.append(entry)
    return items


# -----------------------------------------------------------------------------
# 2. 레이스 결과 수집
# -----------------------------------------------------------------------------
def ingest_results(year):
    """
    연도별 레이스 결과 수집.
    Race 메타 정보 + Results를 합쳐서 flat하게 저장.
    Driver/Constructor 중첩 객체는 JSON string으로 저장 (Silver에서 flatten).
    """
    print(f"\n{'='*60}")
    print(f"[Results] {year}년 레이스 결과 수집 시작")
    print(f"{'='*60}")

    mr_data_list = fetch_jolpica(f"{year}/results.json")
    races = extract_races(mr_data_list)

    all_results = []
    for race in races:
        race_meta = {
            "year": int(race.get("season", year)),
            "round": race.get("round", ""),
            "race_name": race.get("raceName", ""),
            "circuit_id": race.get("Circuit", {}).get("circuitId", ""),
            "circuit_name": race.get("Circuit", {}).get("circuitName", ""),
            "race_date": race.get("date", ""),
            "race_time": race.get("time", ""),
        }

        for result in race.get("Results", []):
            row = {**race_meta}
            row["number"] = result.get("number", "")
            row["position"] = result.get("position", "")
            row["position_text"] = result.get("positionText", "")
            row["points"] = result.get("points", "")
            row["grid"] = result.get("grid", "")
            row["laps"] = result.get("laps", "")
            row["status"] = result.get("status", "")

            # Time (1위: 절대시간, 2위+: 갭)
            time_obj = result.get("Time", {})
            row["time_millis"] = time_obj.get("millis", "")
            row["time_text"] = time_obj.get("time", "")

            # FastestLap (리타이어 등에서 없을 수 있음)
            fl = result.get("FastestLap", {})
            row["fastest_lap_rank"] = fl.get("rank", "")
            row["fastest_lap_number"] = fl.get("lap", "")
            row["fastest_lap_time"] = fl.get("Time", {}).get("time", "")

            # Driver (JSON string으로 보존)
            row["driver_json"] = json.dumps(result.get("Driver", {}))

            # Constructor (JSON string으로 보존)
            row["constructor_json"] = json.dumps(result.get("Constructor", {}))

            all_results.append(row)

    save_to_bronze_jolpica(all_results, TABLES.BRONZE_RESULTS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 3. 드라이버 스탠딩 수집
# -----------------------------------------------------------------------------
def ingest_driver_standings(year):
    """
    연도별 드라이버 챔피언십 스탠딩 수집.
    Constructors 배열은 JSON string으로 보존 (시즌 중 이적 케이스).
    """
    print(f"\n{'='*60}")
    print(f"[Driver Standings] {year}년 드라이버 스탠딩 수집 시작")
    print(f"{'='*60}")

    mr_data_list = fetch_jolpica(f"{year}/driverStandings.json")
    standings = extract_standings(mr_data_list, "DriverStandings")

    all_rows = []
    for entry in standings:
        row = {
            "year": int(entry.get("_season", year)),
            "round": entry.get("_round", ""),
            "position": entry.get("position", ""),
            "position_text": entry.get("positionText", ""),
            "points": entry.get("points", ""),
            "wins": entry.get("wins", ""),
            "driver_json": json.dumps(entry.get("Driver", {})),
            "constructors_json": json.dumps(entry.get("Constructors", [])),
        }
        all_rows.append(row)

    save_to_bronze_jolpica(all_rows, TABLES.BRONZE_DRIVER_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 4. 컨스트럭터 스탠딩 수집
# -----------------------------------------------------------------------------
def ingest_constructor_standings(year):
    """연도별 컨스트럭터 챔피언십 스탠딩 수집."""
    print(f"\n{'='*60}")
    print(f"[Constructor Standings] {year}년 컨스트럭터 스탠딩 수집 시작")
    print(f"{'='*60}")

    mr_data_list = fetch_jolpica(f"{year}/constructorStandings.json")
    standings = extract_standings(mr_data_list, "ConstructorStandings")

    all_rows = []
    for entry in standings:
        row = {
            "year": int(entry.get("_season", year)),
            "round": entry.get("_round", ""),
            "position": entry.get("position", ""),
            "position_text": entry.get("positionText", ""),
            "points": entry.get("points", ""),
            "wins": entry.get("wins", ""),
            "constructor_json": json.dumps(entry.get("Constructor", {})),
        }
        all_rows.append(row)

    save_to_bronze_jolpica(all_rows, TABLES.BRONZE_CONSTRUCTOR_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 5. 저장 유틸리티
# -----------------------------------------------------------------------------
def save_to_bronze_jolpica(data, table_name, partition_cols=None):
    """Jolpica 데이터를 Delta Table로 저장."""
    if not data:
        print(f"[SKIP] {table_name}: 데이터 없음")
        return

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
# 6. 메인 수집 오케스트레이터
# -----------------------------------------------------------------------------
def ingest_all(year):
    """
    해당 연도의 Jolpica 데이터를 전부 수집.

    Args:
        year: 수집 연도
    """
    print(f"\n{'#'*60}")
    print(f"# Jolpica Bronze 수집 시작: {year}년")
    print(f"{'#'*60}")

    steps = [
        ("Results", ingest_results),
        ("Driver Standings", ingest_driver_standings),
        ("Constructor Standings", ingest_constructor_standings),
    ]

    for name, func in steps:
        try:
            func(year)
        except Exception as e:
            print(f"[ERROR] {name}: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# Jolpica Bronze 수집 완료: {year}년")
    print(f"{'#'*60}")


def ingest_history(start_year=2000, end_year=2025):
    """
    역사 데이터 대량 수집.
    Jolpica rate limit 대비 연도 간 2초 sleep.
    """
    print(f"\n역사 데이터 수집: {start_year}~{end_year}")
    for year in range(start_year, end_year + 1):
        ingest_all(year)
        time.sleep(2)
