# Databricks notebook source

# COMMAND ----------

# MAGIC %run ../config

# COMMAND ----------

# =============================================================================
# Gold → Supabase 데이터 적재
# =============================================================================
# Gold Delta Table → PostgreSQL (Supabase) INSERT.
# lap_analysis, position_changes는 데이터량이 크므로 S3에서 직접 서빙.
# =============================================================================

import json

# -----------------------------------------------------------------------------
# Supabase 연결 설정 (Databricks Secret Scope 사용)
# -----------------------------------------------------------------------------
DB_HOST = "aws-1-us-east-1.pooler.supabase.com"
DB_PORT = 6543
DB_NAME = "postgres"
DB_USER = "postgres.mpvrekmlokgmmbzhcleo"
DB_PASS = "Wookie1143ok!"


def get_pg_connection():
    """PostgreSQL 연결 반환."""
    import psycopg2
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
    )


def read_gold(table_name):
    """Gold Delta Table 읽기."""
    path = f"{S3.GOLD_PATH}/{table_name}"
    return spark.read.format("delta").load(path)


# -----------------------------------------------------------------------------
# 공통 적재 함수
# -----------------------------------------------------------------------------
def upsert_to_pg(df, pg_table, conflict_cols):
    """
    Spark DataFrame → PostgreSQL UPSERT (ON CONFLICT DO UPDATE).
    소규모 데이터 (수천~수만 행) 대상이므로 collect() 후 batch insert.
    """
    rows = df.toPandas().to_dict("records")
    if not rows:
        print(f"  [{pg_table}] 데이터 없음, 스킵")
        return

    cols = list(rows[0].keys())
    placeholders = ", ".join(["%s"] * len(cols))
    col_names = ", ".join(cols)
    update_set = ", ".join([f"{c} = EXCLUDED.{c}" for c in cols if c not in conflict_cols])
    conflict = ", ".join(conflict_cols)

    sql = f"""
        INSERT INTO {pg_table} ({col_names})
        VALUES ({placeholders})
        ON CONFLICT ({conflict}) DO UPDATE SET {update_set}
    """

    conn = get_pg_connection()
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # 기존 데이터 삭제 후 INSERT (간단한 full refresh)
        cur.execute(f"TRUNCATE TABLE {pg_table}")

        batch_size = 500
        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            values = [tuple(row[c] for c in cols) for row in batch]
            cur.executemany(sql, values)

        conn.commit()
        print(f"  [{pg_table}] {len(rows)}행 적재 완료")
    except Exception as e:
        conn.rollback()
        print(f"  [{pg_table}] ERROR: {e}")
        raise
    finally:
        cur.close()
        conn.close()


# -----------------------------------------------------------------------------
# 테이블별 적재
# -----------------------------------------------------------------------------
def sync_sessions():
    """Silver sessions → PG sessions (레퍼런스)."""
    print("\n[Sync] sessions")
    df = spark.read.format("delta").load(f"{S3.SILVER_PATH}/{TABLES.SILVER_SESSIONS}")
    df = df.select(
        "session_key", "year", "session_name", "session_type",
        "circuit_key", "circuit_short_name", "country_name", "country_code",
        "location", "date_start", "date_end", "gmt_offset",
    )
    upsert_to_pg(df, "sessions", ["session_key"])


def sync_drivers():
    """Silver drivers → PG drivers (레퍼런스)."""
    print("\n[Sync] drivers")
    df = spark.read.format("delta").load(f"{S3.SILVER_PATH}/{TABLES.SILVER_DRIVERS}")
    df = df.select(
        "driver_number", "broadcast_name", "full_name", "name_acronym",
        "team_name", "team_colour", "headshot_url", "country_code",
        "session_key", "year",
    )
    upsert_to_pg(df, "drivers", ["driver_number", "session_key"])


def sync_race_summary():
    """Gold race_summary → PG."""
    print("\n[Sync] race_summary")
    df = read_gold(TABLES.GOLD_RACE_SUMMARY).select(
        "session_key", "year", "round", "circuit_short_name", "country_name",
        "country_code", "location", "date_start",
        "winner_driver_id", "winner_code", "winner_name", "winner_team",
        "winning_time", "total_laps", "safety_car_events", "red_flag_count",
    )
    upsert_to_pg(df, "race_summary", ["year", "round"])


def sync_driver_race_result():
    """Gold driver_race_result → PG."""
    print("\n[Sync] driver_race_result")
    df = read_gold(TABLES.GOLD_DRIVER_RACE_RESULT).select(
        "year", "round", "driver_number", "driver_id", "driver_code",
        "driver_family_name", "constructor_id", "constructor_name",
        "position", "grid", "positions_gained", "points", "status",
        "laps_completed", "fastest_lap_rank", "fastest_lap_time",
    )
    upsert_to_pg(df, "driver_race_result", ["year", "round", "driver_id"])


def sync_pit_strategy():
    """Gold pit_strategy → PG."""
    print("\n[Sync] pit_strategy")
    df = read_gold(TABLES.GOLD_PIT_STRATEGY).select(
        "session_key", "driver_number", "year",
        "stint_number", "compound", "lap_start", "lap_end",
        "stint_laps", "tyre_age_at_start", "pit_duration_seconds",
    )
    upsert_to_pg(df, "pit_strategy", ["session_key", "driver_number", "stint_number"])


def sync_driver_standings():
    """Gold driver_standings → PG."""
    print("\n[Sync] driver_standings")
    df = read_gold(TABLES.GOLD_DRIVER_STANDINGS).select(
        "year", "round", "position", "points", "wins",
        "driver_id", "driver_code", "driver_given_name", "driver_family_name",
        "driver_nationality", "constructor_id", "constructor_name", "team_changed",
    )
    upsert_to_pg(df, "driver_standings", ["year", "round", "driver_id"])


def sync_constructor_standings():
    """Gold constructor_standings → PG."""
    print("\n[Sync] constructor_standings")
    df = read_gold(TABLES.GOLD_CONSTRUCTOR_STANDINGS).select(
        "year", "round", "position", "points", "wins",
        "constructor_id", "constructor_name", "constructor_nationality",
    )
    upsert_to_pg(df, "constructor_standings", ["year", "round", "constructor_id"])


def sync_head_to_head():
    """Gold head_to_head → PG."""
    print("\n[Sync] head_to_head")
    df = read_gold(TABLES.GOLD_HEAD_TO_HEAD).select(
        "year", "round", "constructor_id", "constructor_name",
        "driver1_id", "driver1_code", "driver1_position", "driver1_points",
        "driver2_id", "driver2_code", "driver2_position", "driver2_points",
        "race_winner",
    )
    upsert_to_pg(df, "head_to_head", ["year", "round", "constructor_id", "driver1_id", "driver2_id"])


# -----------------------------------------------------------------------------
# 메인
# -----------------------------------------------------------------------------
def sync_all():
    """Gold → Supabase 전체 동기화."""
    print(f"\n{'#'*60}")
    print(f"# Gold → Supabase 동기화 시작")
    print(f"{'#'*60}")

    steps = [
        ("Sessions", sync_sessions),
        ("Drivers", sync_drivers),
        ("Race Summary", sync_race_summary),
        ("Driver Race Result", sync_driver_race_result),
        ("Pit Strategy", sync_pit_strategy),
        ("Driver Standings", sync_driver_standings),
        ("Constructor Standings", sync_constructor_standings),
        ("Head to Head", sync_head_to_head),
    ]

    for name, func in steps:
        try:
            func()
        except Exception as e:
            print(f"[ERROR] {name}: {e}")
            continue

    print(f"\n{'#'*60}")
    print(f"# Gold → Supabase 동기화 완료")
    print(f"{'#'*60}")


# 실행
sync_all()
