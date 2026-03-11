# Databricks notebook source
# =============================================================================
# Gold — 비즈니스 집계 테이블
# =============================================================================
# Silver 정제 데이터를 집계하여 프론트엔드/API에서 직접 서빙할 수 있는 테이블 생성.
#
# 실행: %run ../config 후 aggregate_all()
# =============================================================================

from pyspark.sql import functions as F
from pyspark.sql.types import IntegerType, DoubleType
from pyspark.sql.window import Window


# -----------------------------------------------------------------------------
# 유틸리티
# -----------------------------------------------------------------------------
def read_silver(table_name):
    """Silver Delta Table 읽기."""
    path = f"{S3.SILVER_PATH}/{table_name}"
    return spark.read.format("delta").load(path)


def save_to_gold(df, table_name, partition_cols=None):
    """Gold Delta Table 저장 + Unity Catalog 등록."""
    path = f"{S3.GOLD_PATH}/{table_name}"
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
# 1. Race Summary (레이스별 요약)
# -----------------------------------------------------------------------------
def aggregate_race_summary():
    """
    레이스별 요약: 우승자, 총 랩 수, SC/VSC 횟수, 레드 플래그 여부.
    sources: silver_sessions, silver_results, silver_race_control
    """
    print("\n[Gold] Race Summary 집계 시작")

    sessions = read_silver(TABLES.SILVER_SESSIONS).filter(F.col("session_type") == "Race")
    results = read_silver(TABLES.SILVER_RESULTS)
    race_control = read_silver(TABLES.SILVER_RACE_CONTROL)

    # 우승자 정보
    winners = results.filter(F.col("position") == 1).select(
        "year", "round",
        F.col("driver_id").alias("winner_driver_id"),
        F.col("driver_code").alias("winner_code"),
        F.col("driver_family_name").alias("winner_name"),
        F.col("constructor_name").alias("winner_team"),
        F.col("time_text").alias("winning_time"),
        F.col("laps_completed").alias("total_laps"),
    )

    # SC/VSC/Red Flag 횟수
    sc_counts = race_control.filter(
        F.col("category") == "SafetyCar"
    ).groupBy("session_key").agg(
        F.count("*").alias("safety_car_events"),
    )

    red_flags = race_control.filter(
        (F.col("category") == "Flag") & (F.col("flag") == "RED")
    ).groupBy("session_key").agg(
        F.count("*").alias("red_flag_count"),
    )

    # 세션 + 우승자 조인
    df_gold = sessions.select(
        "session_key", "year", "circuit_short_name", "country_name",
        "country_code", "location", "date_start",
    ).join(
        winners,
        on=["year"],
        how="left",
    ).join(
        sc_counts, on="session_key", how="left"
    ).join(
        red_flags, on="session_key", how="left"
    ).fillna(0, subset=["safety_car_events", "red_flag_count"])

    save_to_gold(df_gold, TABLES.GOLD_RACE_SUMMARY, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 2. Driver Race Result (드라이버별 레이스 결과)
# -----------------------------------------------------------------------------
def aggregate_driver_race_result():
    """
    드라이버별 레이스 결과: 순위, 포인트, 그리드→피니시, 피트 횟수, 최고 랩.
    sources: silver_results, silver_pit, silver_stints, silver_laps
    """
    print("\n[Gold] Driver Race Result 집계 시작")

    results = read_silver(TABLES.SILVER_RESULTS)
    pit = read_silver(TABLES.SILVER_PIT)
    stints = read_silver(TABLES.SILVER_STINTS)
    laps = read_silver(TABLES.SILVER_LAPS)

    # 세션 키 매핑 (results에는 session_key가 없으므로 sessions에서 가져옴)
    sessions = read_silver(TABLES.SILVER_SESSIONS).filter(
        F.col("session_type") == "Race"
    ).select("session_key", "year", "circuit_short_name")

    # 피트 횟수
    pit_counts = pit.groupBy("session_key", "driver_number").agg(
        F.count("*").alias("pit_stop_count"),
        F.round(F.avg("pit_duration_seconds"), 2).alias("avg_pit_duration"),
    )

    # 최고 랩 타임
    best_laps = laps.filter(
        F.col("lap_duration").isNotNull() & (F.col("is_pit_out_lap") == False)
    ).groupBy("session_key", "driver_number").agg(
        F.round(F.min("lap_duration"), 3).alias("best_lap_time"),
    )

    # 스틴트 수
    stint_counts = stints.groupBy("session_key", "driver_number").agg(
        F.max("stint_number").alias("total_stints"),
    )

    # 결과 + 피트 + 최고랩 + 스틴트 조인
    df_gold = results.select(
        "year", "round", "driver_number", "driver_id", "driver_code",
        "driver_family_name", "constructor_id", "constructor_name",
        "position", "grid", "positions_gained", "points", "status",
        "laps_completed", "fastest_lap_rank", "fastest_lap_time",
    )

    save_to_gold(df_gold, TABLES.GOLD_DRIVER_RACE_RESULT, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 3. Lap Analysis (랩별 분석)
# -----------------------------------------------------------------------------
def aggregate_lap_analysis():
    """
    랩별 분석: 랩타임 추이 + 타이어 컴파운드 정보.
    sources: silver_laps, silver_stints
    """
    print("\n[Gold] Lap Analysis 집계 시작")

    laps = read_silver(TABLES.SILVER_LAPS)
    stints = read_silver(TABLES.SILVER_STINTS)

    # 랩에 스틴트(타이어) 정보 조인
    # 랩 번호가 stint의 lap_start ~ lap_end 범위에 있으면 매칭
    df_gold = laps.join(
        stints.select("session_key", "driver_number", "stint_number",
                       "lap_start", "lap_end", "compound", "tyre_age_at_start"),
        on=["session_key", "driver_number"],
        how="left",
    ).filter(
        (F.col("lap_number") >= F.col("lap_start")) &
        (F.col("lap_number") < F.col("lap_end"))
    ).select(
        "session_key", "driver_number", "lap_number", "year",
        "lap_duration", "duration_sector_1", "duration_sector_2", "duration_sector_3",
        "i1_speed", "i2_speed", "st_speed", "is_pit_out_lap",
        "compound", "stint_number",
        (F.col("tyre_age_at_start") + F.col("lap_number") - F.col("lap_start")).alias("tyre_age"),
    )

    save_to_gold(df_gold, TABLES.GOLD_LAP_ANALYSIS, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 4. Pit Strategy (피트 전략 요약)
# -----------------------------------------------------------------------------
def aggregate_pit_strategy():
    """
    드라이버별 피트 전략: 피트 타이밍, 스틴트별 타이어, 총 피트 횟수.
    sources: silver_pit, silver_stints
    """
    print("\n[Gold] Pit Strategy 집계 시작")

    pit = read_silver(TABLES.SILVER_PIT)
    stints = read_silver(TABLES.SILVER_STINTS)

    # 스틴트 요약
    stint_summary = stints.select(
        "session_key", "driver_number", "stint_number",
        "lap_start", "lap_end", "compound", "tyre_age_at_start", "stint_laps",
        "year",
    )

    # 피트 정보 조인
    df_gold = stint_summary.join(
        pit.select("session_key", "driver_number", "lap_number", "pit_duration_seconds"),
        on=["session_key", "driver_number"],
        how="left",
    ).filter(
        F.col("lap_number") == F.col("lap_start")
    ).select(
        "session_key", "driver_number", "year",
        "stint_number", "compound", "lap_start", "lap_end",
        "stint_laps", "tyre_age_at_start", "pit_duration_seconds",
    ).unionByName(
        # 첫 번째 스틴트 (피트 없이 시작)
        stint_summary.filter(F.col("stint_number") == 1).select(
            "session_key", "driver_number", "year",
            "stint_number", "compound", "lap_start", "lap_end",
            "stint_laps", "tyre_age_at_start",
            F.lit(None).cast(DoubleType()).alias("pit_duration_seconds"),
        ),
        allowMissingColumns=True,
    ).dropDuplicates(["session_key", "driver_number", "stint_number"])

    save_to_gold(df_gold, TABLES.GOLD_PIT_STRATEGY, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 5. Position Changes (랩별 포지션 변화)
# -----------------------------------------------------------------------------
def aggregate_position_changes():
    """
    position 시계열 → lap 단위 snapshot.
    각 랩 시작 시점의 포지션을 기록.
    sources: silver_position, silver_laps
    """
    print("\n[Gold] Position Changes 집계 시작")

    position = read_silver(TABLES.SILVER_POSITION)
    laps = read_silver(TABLES.SILVER_LAPS).select(
        "session_key", "driver_number", "lap_number", "date_start"
    )

    # 각 랩 시작 시점 이전의 마지막 포지션을 가져옴
    df_joined = laps.join(
        position,
        on=["session_key", "driver_number"],
        how="inner",
    ).filter(
        F.col("position.date") <= F.col("laps.date_start")
    )

    # 랩별 가장 최근 포지션
    w = Window.partitionBy("session_key", "driver_number", "lap_number").orderBy(F.desc("position.date"))
    df_gold = df_joined.withColumn("rn", F.row_number().over(w)).filter(
        F.col("rn") == 1
    ).select(
        F.col("laps.session_key").alias("session_key"),
        F.col("laps.driver_number").alias("driver_number"),
        "lap_number",
        F.col("position.position").alias("position"),
        F.col("year"),
    )

    save_to_gold(df_gold, TABLES.GOLD_POSITION_CHANGES, partition_cols=["year", "session_key"])


# -----------------------------------------------------------------------------
# 6. Driver Standings (챔피언십 현황)
# -----------------------------------------------------------------------------
def aggregate_driver_standings():
    """Silver driver standings를 그대로 Gold로."""
    print("\n[Gold] Driver Standings 집계 시작")

    df = read_silver(TABLES.SILVER_DRIVER_STANDINGS)
    save_to_gold(df, TABLES.GOLD_DRIVER_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 7. Constructor Standings (컨스트럭터 현황)
# -----------------------------------------------------------------------------
def aggregate_constructor_standings():
    """Silver constructor standings를 그대로 Gold로."""
    print("\n[Gold] Constructor Standings 집계 시작")

    df = read_silver(TABLES.SILVER_CONSTRUCTOR_STANDINGS)
    save_to_gold(df, TABLES.GOLD_CONSTRUCTOR_STANDINGS, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 8. Head to Head (팀메이트 비교)
# -----------------------------------------------------------------------------
def aggregate_head_to_head():
    """
    같은 팀 드라이버 간 퀄리/레이스 H2H 비교.
    sources: silver_results
    """
    print("\n[Gold] Head to Head 집계 시작")

    results = read_silver(TABLES.SILVER_RESULTS)

    # 같은 팀, 같은 레이스 드라이버 쌍
    r1 = results.alias("r1")
    r2 = results.alias("r2")

    pairs = r1.join(
        r2,
        on=[
            F.col("r1.year") == F.col("r2.year"),
            F.col("r1.round") == F.col("r2.round"),
            F.col("r1.constructor_id") == F.col("r2.constructor_id"),
            F.col("r1.driver_id") < F.col("r2.driver_id"),  # 중복 방지
        ],
        how="inner",
    ).select(
        F.col("r1.year").alias("year"),
        F.col("r1.round").alias("round"),
        F.col("r1.constructor_id").alias("constructor_id"),
        F.col("r1.constructor_name").alias("constructor_name"),
        F.col("r1.driver_id").alias("driver1_id"),
        F.col("r1.driver_code").alias("driver1_code"),
        F.col("r1.position").alias("driver1_position"),
        F.col("r1.points").alias("driver1_points"),
        F.col("r2.driver_id").alias("driver2_id"),
        F.col("r2.driver_code").alias("driver2_code"),
        F.col("r2.position").alias("driver2_position"),
        F.col("r2.points").alias("driver2_points"),
        F.when(
            F.col("r1.position") < F.col("r2.position"), F.col("r1.driver_code")
        ).when(
            F.col("r2.position") < F.col("r1.position"), F.col("r2.driver_code")
        ).otherwise(F.lit("TIE")).alias("race_winner"),
    )

    save_to_gold(pairs, TABLES.GOLD_HEAD_TO_HEAD, partition_cols=["year"])


# -----------------------------------------------------------------------------
# 메인
# -----------------------------------------------------------------------------
def aggregate_all():
    """Silver → Gold 전체 집계."""
    print(f"\n{'#'*60}")
    print(f"# Gold 집계 시작")
    print(f"{'#'*60}")

    steps = [
        ("Race Summary", aggregate_race_summary),
        ("Driver Race Result", aggregate_driver_race_result),
        ("Lap Analysis", aggregate_lap_analysis),
        ("Pit Strategy", aggregate_pit_strategy),
        ("Position Changes", aggregate_position_changes),
        ("Driver Standings", aggregate_driver_standings),
        ("Constructor Standings", aggregate_constructor_standings),
        ("Head to Head", aggregate_head_to_head),
    ]

    for name, func in steps:
        try:
            func()
        except Exception as e:
            print(f"[ERROR] {name}: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# Gold 집계 완료")
    print(f"{'#'*60}")
