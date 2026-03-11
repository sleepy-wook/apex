# Databricks notebook source
# =============================================================================
# Silver — OpenF1 데이터 정제
# =============================================================================
# Bronze 원본 데이터를 정제하여 Silver 레이어로 변환합니다.
# - datetime 파싱
# - null 처리
# - 중복 제거
# - 타입 정규화
#
# 실행: %run ../config 후 transform_all()
# =============================================================================

from pyspark.sql import functions as F
from pyspark.sql.types import TimestampType, IntegerType, DoubleType, BooleanType


# -----------------------------------------------------------------------------
# 유틸리티
# -----------------------------------------------------------------------------
def read_bronze(table_name):
    """Bronze Delta Table 읽기."""
    path = f"{S3.BRONZE_PATH}/{table_name}"
    return spark.read.format("delta").load(path)


def save_to_silver(df, table_name, partition_cols=None):
    """Silver Delta Table 저장 + Unity Catalog 등록."""
    path = f"{S3.SILVER_PATH}/{table_name}"
    writer = df.write.format("delta").mode("overwrite").option("overwriteSchema", "true")
    if partition_cols:
        writer = writer.partitionBy(*partition_cols)
    writer.save(path)

    spark.sql(f"""
        CREATE TABLE IF NOT EXISTS {table(table_name)}
        USING DELTA LOCATION '{path}'
    """)
    print(f"[OK] {table_name}: {df.count()}행 → {path}")


# -----------------------------------------------------------------------------
# 1. Sessions
# -----------------------------------------------------------------------------
def transform_sessions():
    """
    Bronze → Silver 세션 정제.
    - date_start/end → timestamp 변환
    - gmt_offset 보존 (string)
    """
    print("\n[Silver] Sessions 변환 시작")
    df = read_bronze(TABLES.BRONZE_SESSIONS)

    df_silver = df.select(
        F.col("session_key").cast(IntegerType()),
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_type"),
        F.col("session_name"),
        F.to_timestamp("date_start").alias("date_start"),
        F.to_timestamp("date_end").alias("date_end"),
        F.col("circuit_key").cast(IntegerType()),
        F.col("circuit_short_name"),
        F.col("country_key").cast(IntegerType()),
        F.col("country_code"),
        F.col("country_name"),
        F.col("location"),
        F.col("gmt_offset"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key"])

    save_to_silver(df_silver, TABLES.SILVER_SESSIONS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 2. Drivers
# -----------------------------------------------------------------------------
def transform_drivers():
    """
    Bronze → Silver 드라이버 정제.
    - country_code null → 'N/A'
    - headshot_url null → empty string
    - session_key + driver_number 기준 중복 제거
    """
    print("\n[Silver] Drivers 변환 시작")
    df = read_bronze(TABLES.BRONZE_DRIVERS)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.col("driver_number").cast(IntegerType()),
        F.col("broadcast_name"),
        F.col("full_name"),
        F.col("name_acronym"),
        F.col("team_name"),
        F.col("team_colour"),
        F.col("first_name"),
        F.col("last_name"),
        F.coalesce(F.col("headshot_url"), F.lit("")).alias("headshot_url"),
        F.coalesce(F.col("country_code"), F.lit("N/A")).alias("country_code"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "driver_number"])

    save_to_silver(df_silver, TABLES.SILVER_DRIVERS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 3. Laps
# -----------------------------------------------------------------------------
def transform_laps():
    """
    Bronze → Silver 랩 타임 정제.
    - pit lap null 값 보존 (제거 X)
    - segments는 Bronze에서 이미 JSON string
    - date_start → timestamp
    """
    print("\n[Silver] Laps 변환 시작")
    df = read_bronze(TABLES.BRONZE_LAPS)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.col("driver_number").cast(IntegerType()),
        F.col("lap_number").cast(IntegerType()),
        F.to_timestamp("date_start").alias("date_start"),
        F.col("lap_duration").cast(DoubleType()),
        F.col("duration_sector_1").cast(DoubleType()),
        F.col("duration_sector_2").cast(DoubleType()),
        F.col("duration_sector_3").cast(DoubleType()),
        F.col("i1_speed").cast(IntegerType()),
        F.col("i2_speed").cast(IntegerType()),
        F.col("st_speed").cast(IntegerType()),
        F.col("is_pit_out_lap").cast(BooleanType()),
        F.col("segments_sector_1"),
        F.col("segments_sector_2"),
        F.col("segments_sector_3"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "driver_number", "lap_number"])

    save_to_silver(df_silver, TABLES.SILVER_LAPS, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 4. Pit Stops
# -----------------------------------------------------------------------------
def transform_pit():
    """
    Bronze → Silver 피트스탑 정제.
    - 3개 duration → pit_duration_seconds 하나로 통일
      COALESCE: pit_duration > lane_duration > stop_duration
    """
    print("\n[Silver] Pit 변환 시작")
    df = read_bronze(TABLES.BRONZE_PIT)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.col("driver_number").cast(IntegerType()),
        F.to_timestamp("date").alias("date"),
        F.col("lap_number").cast(IntegerType()),
        F.coalesce(
            F.expr("try_cast(pit_duration as double)"),
            F.expr("try_cast(lane_duration as double)"),
            F.expr("try_cast(stop_duration as double)"),
        ).alias("pit_duration_seconds"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "driver_number", "lap_number"])

    save_to_silver(df_silver, TABLES.SILVER_PIT, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 5. Stints
# -----------------------------------------------------------------------------
def transform_stints():
    """
    Bronze → Silver 스틴트 정제.
    - compound 대문자 통일
    - stint_laps 계산 (lap_end - lap_start)
    """
    print("\n[Silver] Stints 변환 시작")
    df = read_bronze(TABLES.BRONZE_STINTS)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.col("driver_number").cast(IntegerType()),
        F.col("stint_number").cast(IntegerType()),
        F.col("lap_start").cast(IntegerType()),
        F.col("lap_end").cast(IntegerType()),
        F.upper(F.col("compound")).alias("compound"),
        F.col("tyre_age_at_start").cast(IntegerType()),
        (F.col("lap_end").cast(IntegerType()) - F.col("lap_start").cast(IntegerType())).alias("stint_laps"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "driver_number", "stint_number"])

    save_to_silver(df_silver, TABLES.SILVER_STINTS, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 6. Position
# -----------------------------------------------------------------------------
def transform_position():
    """
    Bronze → Silver 포지션 정제.
    - datetime 파싱
    - 중복 제거
    """
    print("\n[Silver] Position 변환 시작")
    df = read_bronze(TABLES.BRONZE_POSITION)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.col("driver_number").cast(IntegerType()),
        F.to_timestamp("date").alias("date"),
        F.col("position").cast(IntegerType()),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "driver_number", "date"])

    save_to_silver(df_silver, TABLES.SILVER_POSITION, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 7. Race Control
# -----------------------------------------------------------------------------
def transform_race_control():
    """
    Bronze → Silver 레이스 컨트롤 정제.
    - nullable 필드 보존
    - datetime 파싱
    """
    print("\n[Silver] Race Control 변환 시작")
    df = read_bronze(TABLES.BRONZE_RACE_CONTROL)

    df_silver = df.select(
        F.col("meeting_key").cast(IntegerType()),
        F.col("session_key").cast(IntegerType()),
        F.to_timestamp("date").alias("date"),
        F.expr("try_cast(driver_number as int)").alias("driver_number"),
        F.expr("try_cast(lap_number as int)").alias("lap_number"),
        F.col("category"),
        F.col("flag"),
        F.col("scope"),
        F.expr("try_cast(sector as int)").alias("sector"),
        F.col("message"),
        F.col("year").cast(IntegerType()),
    ).dropDuplicates(["session_key", "date", "message"])

    save_to_silver(df_silver, TABLES.SILVER_RACE_CONTROL, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 메인
# -----------------------------------------------------------------------------
def transform_all():
    """OpenF1 Bronze → Silver 전체 변환."""
    print(f"\n{'#'*60}")
    print(f"# OpenF1 Silver 변환 시작")
    print(f"{'#'*60}")

    steps = [
        ("Sessions", transform_sessions),
        ("Drivers", transform_drivers),
        ("Laps", transform_laps),
        ("Pit", transform_pit),
        ("Stints", transform_stints),
        ("Position", transform_position),
        ("Race Control", transform_race_control),
    ]

    for name, func in steps:
        try:
            func()
        except Exception as e:
            print(f"[ERROR] {name}: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# OpenF1 Silver 변환 완료")
    print(f"{'#'*60}")
