# Databricks notebook source
# =============================================================================
# Silver — Jolpica 데이터 정제
# =============================================================================
# Bronze 원본 데이터를 정제하여 Silver 레이어로 변환합니다.
# - 모든 숫자 String → int/float 캐스팅
# - Driver/Constructor JSON → flatten
# - 중복 제거
#
# 실행: %run ../config 후 transform_all()
# =============================================================================

from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType, DoubleType


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
    writer = df.write.format("delta").mode("overwrite")
    if partition_cols:
        writer = writer.partitionBy(*partition_cols)
    writer.save(path)

    spark.sql(f"""
        CREATE TABLE IF NOT EXISTS {table(table_name)}
        USING DELTA LOCATION '{path}'
    """)
    print(f"[OK] {table_name}: {df.count()}행 → {path}")


# -----------------------------------------------------------------------------
# 1. Results
# -----------------------------------------------------------------------------
def transform_results():
    """
    Bronze → Silver 레이스 결과 정제.
    - string → int/float 캐스팅
    - driver_json / constructor_json → flatten
    - FastestLap 없는 경우 null 보존
    """
    print("\n[Silver] Results 변환 시작")
    df = read_bronze(TABLES.BRONZE_RESULTS)

    df_silver = df.select(
        F.col("year").cast(IntegerType()),
        F.col("round").cast(IntegerType()),
        F.col("race_name"),
        F.col("circuit_id"),
        F.col("circuit_name"),
        F.col("race_date"),
        F.col("number").cast(IntegerType()).alias("driver_number"),
        F.col("position").cast(IntegerType()),
        F.col("position_text"),
        F.col("points").cast(DoubleType()),
        F.col("grid").cast(IntegerType()),
        F.col("laps").cast(IntegerType()).alias("laps_completed"),
        F.col("status"),
        F.col("time_millis").cast(IntegerType()),
        F.col("time_text"),
        F.col("fastest_lap_rank").cast(IntegerType()),
        F.col("fastest_lap_number").cast(IntegerType()),
        F.col("fastest_lap_time"),
        # Driver flatten
        F.get_json_object("driver_json", "$.driverId").alias("driver_id"),
        F.get_json_object("driver_json", "$.code").alias("driver_code"),
        F.get_json_object("driver_json", "$.givenName").alias("driver_given_name"),
        F.get_json_object("driver_json", "$.familyName").alias("driver_family_name"),
        F.get_json_object("driver_json", "$.nationality").alias("driver_nationality"),
        # Constructor flatten
        F.get_json_object("constructor_json", "$.constructorId").alias("constructor_id"),
        F.get_json_object("constructor_json", "$.name").alias("constructor_name"),
        F.get_json_object("constructor_json", "$.nationality").alias("constructor_nationality"),
        # 그리드 대비 순위 변화
        (F.col("grid").cast(IntegerType()) - F.col("position").cast(IntegerType())).alias("positions_gained"),
    ).dropDuplicates(["year", "round", "driver_number"])

    save_to_silver(df_silver, TABLES.SILVER_RESULTS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 2. Driver Standings
# -----------------------------------------------------------------------------
def transform_driver_standings():
    """
    Bronze → Silver 드라이버 스탠딩 정제.
    - string → int/float 캐스팅
    - Driver JSON flatten
    - Constructors 배열 → 첫 번째 팀 기준 (이적 시 team_changes 플래그)
    """
    print("\n[Silver] Driver Standings 변환 시작")
    df = read_bronze(TABLES.BRONZE_DRIVER_STANDINGS)

    df_silver = df.select(
        F.col("year").cast(IntegerType()),
        F.col("round").cast(IntegerType()),
        F.col("position").cast(IntegerType()),
        F.col("points").cast(DoubleType()),
        F.col("wins").cast(IntegerType()),
        # Driver flatten
        F.get_json_object("driver_json", "$.driverId").alias("driver_id"),
        F.get_json_object("driver_json", "$.code").alias("driver_code"),
        F.get_json_object("driver_json", "$.givenName").alias("driver_given_name"),
        F.get_json_object("driver_json", "$.familyName").alias("driver_family_name"),
        F.get_json_object("driver_json", "$.permanentNumber").cast(IntegerType()).alias("permanent_number"),
        F.get_json_object("driver_json", "$.nationality").alias("driver_nationality"),
        F.get_json_object("driver_json", "$.dateOfBirth").alias("date_of_birth"),
        # 첫 번째 Constructor
        F.get_json_object("constructors_json", "$[0].constructorId").alias("constructor_id"),
        F.get_json_object("constructors_json", "$[0].name").alias("constructor_name"),
        # 이적 여부 플래그
        F.when(
            F.get_json_object("constructors_json", "$[1].constructorId").isNotNull(),
            F.lit(True)
        ).otherwise(F.lit(False)).alias("team_changed"),
        # 원본 보존
        F.col("constructors_json"),
    ).dropDuplicates(["year", "round", "driver_id"])

    save_to_silver(df_silver, TABLES.SILVER_DRIVER_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 3. Constructor Standings
# -----------------------------------------------------------------------------
def transform_constructor_standings():
    """
    Bronze → Silver 컨스트럭터 스탠딩 정제.
    - string → int/float 캐스팅
    - Constructor JSON flatten
    """
    print("\n[Silver] Constructor Standings 변환 시작")
    df = read_bronze(TABLES.BRONZE_CONSTRUCTOR_STANDINGS)

    df_silver = df.select(
        F.col("year").cast(IntegerType()),
        F.col("round").cast(IntegerType()),
        F.col("position").cast(IntegerType()),
        F.col("points").cast(DoubleType()),
        F.col("wins").cast(IntegerType()),
        # Constructor flatten
        F.get_json_object("constructor_json", "$.constructorId").alias("constructor_id"),
        F.get_json_object("constructor_json", "$.name").alias("constructor_name"),
        F.get_json_object("constructor_json", "$.nationality").alias("constructor_nationality"),
    ).dropDuplicates(["year", "round", "constructor_id"])

    save_to_silver(df_silver, TABLES.SILVER_CONSTRUCTOR_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 메인
# -----------------------------------------------------------------------------
def transform_all():
    """Jolpica Bronze → Silver 전체 변환."""
    print(f"\n{'#'*60}")
    print(f"# Jolpica Silver 변환 시작")
    print(f"{'#'*60}")

    steps = [
        ("Results", transform_results),
        ("Driver Standings", transform_driver_standings),
        ("Constructor Standings", transform_constructor_standings),
    ]

    for name, func in steps:
        try:
            func()
        except Exception as e:
            print(f"[ERROR] {name}: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# Jolpica Silver 변환 완료")
    print(f"{'#'*60}")
