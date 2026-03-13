-- =============================================================================
-- Apex F1 — Supabase PostgreSQL 스키마
-- =============================================================================
-- Gold 테이블 기반. Databricks에서 집계된 데이터를 적재.
-- 실행: Supabase SQL Editor에서 실행
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. race_summary (레이스별 요약)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS race_summary (
    id              BIGSERIAL PRIMARY KEY,
    session_key     INTEGER,
    year            INTEGER NOT NULL,
    round           INTEGER,
    circuit_short_name TEXT,
    country_name    TEXT,
    country_code    TEXT,
    location        TEXT,
    date_start      TIMESTAMPTZ,
    winner_driver_id TEXT,
    winner_code     TEXT,
    winner_name     TEXT,
    winner_team     TEXT,
    winning_time    TEXT,
    total_laps      INTEGER,
    safety_car_events INTEGER DEFAULT 0,
    red_flag_count  INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (year, round)
);

CREATE INDEX idx_race_summary_year ON race_summary(year);


-- -----------------------------------------------------------------------------
-- 2. driver_race_result (드라이버별 레이스 결과)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver_race_result (
    id              BIGSERIAL PRIMARY KEY,
    year            INTEGER NOT NULL,
    round           INTEGER NOT NULL,
    driver_number   INTEGER,
    driver_id       TEXT NOT NULL,
    driver_code     TEXT,
    driver_family_name TEXT,
    constructor_id  TEXT,
    constructor_name TEXT,
    position        INTEGER,
    grid            INTEGER,
    positions_gained INTEGER,
    points          DOUBLE PRECISION DEFAULT 0,
    status          TEXT,
    laps_completed  INTEGER,
    fastest_lap_rank INTEGER,
    fastest_lap_time TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (year, round, driver_id)
);

CREATE INDEX idx_driver_race_result_year ON driver_race_result(year);
CREATE INDEX idx_driver_race_result_driver ON driver_race_result(driver_id);
CREATE INDEX idx_driver_race_result_constructor ON driver_race_result(constructor_id);


-- -----------------------------------------------------------------------------
-- 3. lap_analysis (랩별 분석) — S3 Parquet 온디맨드, DB에는 저장 안 함
-- -----------------------------------------------------------------------------
-- lap_analysis는 데이터량이 크므로 S3 Parquet에서 직접 읽음.
-- FastAPI에서 boto3로 S3 Parquet을 쿼리하여 서빙.


-- -----------------------------------------------------------------------------
-- 4. pit_strategy (피트 전략)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pit_strategy (
    id              BIGSERIAL PRIMARY KEY,
    session_key     INTEGER NOT NULL,
    driver_number   INTEGER NOT NULL,
    year            INTEGER NOT NULL,
    stint_number    INTEGER NOT NULL,
    compound        TEXT,
    lap_start       INTEGER,
    lap_end         INTEGER,
    stint_laps      INTEGER,
    tyre_age_at_start INTEGER,
    pit_duration_seconds DOUBLE PRECISION,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (session_key, driver_number, stint_number)
);

CREATE INDEX idx_pit_strategy_session ON pit_strategy(session_key);
CREATE INDEX idx_pit_strategy_year ON pit_strategy(year);


-- -----------------------------------------------------------------------------
-- 5. position_changes (랩별 포지션) — S3 Parquet 온디맨드
-- -----------------------------------------------------------------------------
-- position_changes도 데이터량이 크므로 S3에서 직접 읽음.


-- -----------------------------------------------------------------------------
-- 6. driver_standings (드라이버 챔피언십)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS driver_standings (
    id              BIGSERIAL PRIMARY KEY,
    year            INTEGER NOT NULL,
    round           INTEGER NOT NULL,
    position        INTEGER,
    points          DOUBLE PRECISION DEFAULT 0,
    wins            INTEGER DEFAULT 0,
    driver_id       TEXT NOT NULL,
    driver_code     TEXT,
    driver_given_name TEXT,
    driver_family_name TEXT,
    driver_nationality TEXT,
    constructor_id  TEXT,
    constructor_name TEXT,
    team_changed    BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (year, round, driver_id)
);

CREATE INDEX idx_driver_standings_year ON driver_standings(year);
CREATE INDEX idx_driver_standings_driver ON driver_standings(driver_id);


-- -----------------------------------------------------------------------------
-- 7. constructor_standings (컨스트럭터 챔피언십)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS constructor_standings (
    id              BIGSERIAL PRIMARY KEY,
    year            INTEGER NOT NULL,
    round           INTEGER NOT NULL,
    position        INTEGER,
    points          DOUBLE PRECISION DEFAULT 0,
    wins            INTEGER DEFAULT 0,
    constructor_id  TEXT NOT NULL,
    constructor_name TEXT,
    constructor_nationality TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (year, round, constructor_id)
);

CREATE INDEX idx_constructor_standings_year ON constructor_standings(year);
CREATE INDEX idx_constructor_standings_constructor ON constructor_standings(constructor_id);


-- -----------------------------------------------------------------------------
-- 8. head_to_head (팀메이트 비교)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS head_to_head (
    id              BIGSERIAL PRIMARY KEY,
    year            INTEGER NOT NULL,
    round           INTEGER NOT NULL,
    constructor_id  TEXT NOT NULL,
    constructor_name TEXT,
    driver1_id      TEXT NOT NULL,
    driver1_code    TEXT,
    driver1_position INTEGER,
    driver1_points  DOUBLE PRECISION,
    driver2_id      TEXT NOT NULL,
    driver2_code    TEXT,
    driver2_position INTEGER,
    driver2_points  DOUBLE PRECISION,
    race_winner     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (year, round, constructor_id, driver1_id, driver2_id)
);

CREATE INDEX idx_head_to_head_year ON head_to_head(year);
CREATE INDEX idx_head_to_head_constructor ON head_to_head(constructor_id);


-- -----------------------------------------------------------------------------
-- 9. sessions (세션 정보 — 레퍼런스 테이블)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id              BIGSERIAL PRIMARY KEY,
    session_key     INTEGER UNIQUE NOT NULL,
    year            INTEGER NOT NULL,
    session_name    TEXT,
    session_type    TEXT,
    circuit_key     INTEGER,
    circuit_short_name TEXT,
    country_name    TEXT,
    country_code    TEXT,
    location        TEXT,
    date_start      TIMESTAMPTZ,
    date_end        TIMESTAMPTZ,
    gmt_offset      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_year ON sessions(year);
CREATE INDEX idx_sessions_type ON sessions(session_type);


-- -----------------------------------------------------------------------------
-- 10. drivers (드라이버 레퍼런스)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS drivers (
    id              BIGSERIAL PRIMARY KEY,
    driver_number   INTEGER,
    broadcast_name  TEXT,
    full_name       TEXT,
    name_acronym    TEXT,
    team_name       TEXT,
    team_colour     TEXT,
    headshot_url    TEXT,
    country_code    TEXT,
    session_key     INTEGER,
    year            INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (driver_number, session_key)
);

CREATE INDEX idx_drivers_year ON drivers(year);
CREATE INDEX idx_drivers_team ON drivers(team_name);


-- -----------------------------------------------------------------------------
-- 11. circuits (서킷 정보 — 시드 데이터)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS circuits (
    circuit_key     INTEGER PRIMARY KEY,
    circuit_short_name TEXT NOT NULL,
    circuit_full_name TEXT,
    country_name    TEXT,
    country_code    TEXT,
    city            TEXT,
    track_length_km NUMERIC(5,3),
    turns           INTEGER,
    drs_zones       INTEGER,
    first_gp_year   INTEGER,
    lap_record_time TEXT,
    lap_record_driver TEXT,
    lap_record_year INTEGER,
    latitude        NUMERIC(9,6),
    longitude       NUMERIC(9,6),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_circuits_country ON circuits(country_name);


-- -----------------------------------------------------------------------------
-- 12. team_details (팀 상세 정보 — 시드 데이터)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_details (
    team_name       TEXT PRIMARY KEY,
    full_name       TEXT,
    base_city       TEXT,
    base_country    TEXT,
    founded_year    INTEGER,
    engine_supplier TEXT,
    team_principal  TEXT,
    world_championships INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_details_name ON team_details(team_name);
