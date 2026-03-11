# =============================================================================
# Apex F1 — Databricks 공통 설정
# =============================================================================
# 모든 Bronze/Silver/Gold 노트북에서 import해서 사용합니다.
#
# 사용법 (Databricks 노트북 상단에):
#   %run ./config
# =============================================================================


# -----------------------------------------------------------------------------
# AWS S3 설정
# -----------------------------------------------------------------------------
SECRET_SCOPE = "apex"

class S3:
    BUCKET = "apex-f1-data"
    REGION = "us-east-1"

    # External Location 경로 (Unity Catalog 연동)
    ROOT = f"s3://{BUCKET}"
    BRONZE_PATH = f"{ROOT}/bronze"
    SILVER_PATH = f"{ROOT}/silver"
    GOLD_PATH   = f"{ROOT}/gold"

    # 텔레메트리 Parquet (대용량, DB 외 별도 저장)
    # 경로 형식: s3://apex-f1-data/telemetry/{year}/{session_key}/{driver_number}.parquet
    TELEMETRY_PATH = f"{ROOT}/telemetry"


# -----------------------------------------------------------------------------
# OpenF1 API (2023+)
# -----------------------------------------------------------------------------
class OPENF1:
    BASE_URL = "https://api.openf1.org/v1"

    SESSIONS     = f"{BASE_URL}/sessions"
    DRIVERS      = f"{BASE_URL}/drivers"
    LAPS         = f"{BASE_URL}/laps"
    PIT          = f"{BASE_URL}/pit"
    STINTS       = f"{BASE_URL}/stints"
    POSITION     = f"{BASE_URL}/position"
    RACE_CONTROL = f"{BASE_URL}/race_control"

    # 공식 rate limit 없으나 과도한 호출 시 차단 가능
    RATE_LIMIT_DELAY = 0.35  # 요청 사이 sleep (초)


# -----------------------------------------------------------------------------
# Jolpica-F1 API (1950+, Ergast 후속)
# -----------------------------------------------------------------------------
class JOLPICA:
    BASE_URL = "https://api.jolpi.ca/ergast/f1"

    # 엔드포인트 패턴:
    #   f"{JOLPICA.BASE_URL}/{year}/{round}/results.json"
    #   f"{JOLPICA.BASE_URL}/{year}/driverStandings.json"
    #   f"{JOLPICA.BASE_URL}/{year}/constructorStandings.json"

    DEFAULT_LIMIT = 100  # ?limit= 파라미터


# -----------------------------------------------------------------------------
# Unity Catalog 테이블명
# -----------------------------------------------------------------------------
# TODO: Databricks에서 카탈로그 + 스키마 생성 필요
#   CREATE CATALOG IF NOT EXISTS apex;
#   CREATE SCHEMA IF NOT EXISTS apex.f1;
CATALOG = "apex"
SCHEMA  = "f1"

def table(name):
    """전체 테이블 경로 반환: apex.f1.{name}"""
    return f"{CATALOG}.{SCHEMA}.{name}"


class TABLES:
    # --- Bronze (API 원본 그대로) ---
    BRONZE_SESSIONS             = "bronze_sessions"
    BRONZE_DRIVERS              = "bronze_drivers"
    BRONZE_LAPS                 = "bronze_laps"
    BRONZE_PIT                  = "bronze_pit"
    BRONZE_STINTS               = "bronze_stints"
    BRONZE_POSITION             = "bronze_position"
    BRONZE_RACE_CONTROL         = "bronze_race_control"
    BRONZE_RESULTS              = "bronze_results"
    BRONZE_DRIVER_STANDINGS     = "bronze_driver_standings"
    BRONZE_CONSTRUCTOR_STANDINGS = "bronze_constructor_standings"

    # --- Silver (정제 + 타입 캐스팅 + flatten) ---
    SILVER_SESSIONS             = "silver_sessions"
    SILVER_DRIVERS              = "silver_drivers"
    SILVER_LAPS                 = "silver_laps"
    SILVER_PIT                  = "silver_pit"
    SILVER_STINTS               = "silver_stints"
    SILVER_POSITION             = "silver_position"
    SILVER_RACE_CONTROL         = "silver_race_control"
    SILVER_RESULTS              = "silver_results"
    SILVER_DRIVER_STANDINGS     = "silver_driver_standings"
    SILVER_CONSTRUCTOR_STANDINGS = "silver_constructor_standings"

    # --- Gold (비즈니스 집계) ---
    GOLD_RACE_SUMMARY           = "gold_race_summary"
    GOLD_DRIVER_RACE_RESULT     = "gold_driver_race_result"
    GOLD_LAP_ANALYSIS           = "gold_lap_analysis"
    GOLD_PIT_STRATEGY           = "gold_pit_strategy"
    GOLD_POSITION_CHANGES       = "gold_position_changes"
    GOLD_DRIVER_STANDINGS       = "gold_driver_standings"
    GOLD_CONSTRUCTOR_STANDINGS  = "gold_constructor_standings"
    GOLD_HEAD_TO_HEAD           = "gold_head_to_head"
