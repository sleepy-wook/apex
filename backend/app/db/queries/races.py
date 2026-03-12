from app.db.connection import get_pool


async def fetch_seasons() -> list[int]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT DISTINCT year FROM sessions ORDER BY year DESC"
        )
        return [row["year"] for row in rows]


async def fetch_season_races(year: int) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                s.session_key,
                s.year,
                rs.round,
                s.country_name,
                s.country_code,
                s.circuit_short_name,
                s.location,
                s.date_start,
                s.session_type,
                s.session_name,
                rs.winner_name,
                rs.winner_team,
                d.team_colour AS winner_team_colour
            FROM sessions s
            LEFT JOIN race_summary rs
                ON s.year = rs.year
                AND s.session_key = rs.session_key
            LEFT JOIN drivers d
                ON d.driver_number = (
                    SELECT drr.driver_number
                    FROM driver_race_result drr
                    WHERE drr.year = rs.year AND drr.round = rs.round AND drr.position = 1
                    LIMIT 1
                )
                AND d.session_key = s.session_key
            WHERE s.year = $1
                AND s.session_type = 'Race'
            ORDER BY rs.round
            """,
            year,
        )
        return [dict(r) for r in rows]


async def fetch_session_detail(session_key: int) -> dict | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT
                session_key, year, session_name, session_type,
                circuit_short_name, country_name, country_code,
                location, date_start, date_end
            FROM sessions
            WHERE session_key = $1
            """,
            session_key,
        )
        return dict(row) if row else None


async def fetch_race_summary(year: int, round_num: int) -> dict | None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT rs.*,
                   d.team_colour AS winner_team_colour,
                   d.full_name AS winner_full_name,
                   d.name_acronym AS winner_acronym,
                   d.driver_number AS winner_driver_number
            FROM race_summary rs
            LEFT JOIN drivers d
                ON d.driver_number = (
                    SELECT drr.driver_number
                    FROM driver_race_result drr
                    WHERE drr.year = rs.year AND drr.round = rs.round AND drr.position = 1
                    LIMIT 1
                )
                AND d.session_key = rs.session_key
            WHERE rs.year = $1 AND rs.round = $2
            """,
            year,
            round_num,
        )
        return dict(row) if row else None


async def fetch_race_results(year: int, round_num: int) -> list[dict]:
    """
    Join driver_race_result with drivers to get full_name, name_acronym,
    team_colour, headshot_url. The drivers table is keyed by (driver_number, session_key),
    so we join via the session_key from race_summary.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            WITH race_session AS (
                SELECT session_key
                FROM race_summary
                WHERE year = $1 AND round = $2
                LIMIT 1
            )
            SELECT
                drr.position,
                drr.driver_number,
                COALESCE(d.full_name, drr.driver_family_name, drr.driver_id) AS full_name,
                COALESCE(d.name_acronym, drr.driver_code) AS name_acronym,
                COALESCE(d.team_name, drr.constructor_name) AS team_name,
                COALESCE(d.team_colour, '999999') AS team_colour,
                drr.grid,
                drr.positions_gained,
                drr.points,
                drr.status,
                NULL AS total_time,
                drr.fastest_lap_time,
                0 AS pit_count,
                d.headshot_url
            FROM driver_race_result drr
            LEFT JOIN race_session rs ON TRUE
            LEFT JOIN drivers d
                ON drr.driver_number = d.driver_number
                AND d.session_key = rs.session_key
            WHERE drr.year = $1 AND drr.round = $2
            ORDER BY drr.position NULLS LAST
            """,
            year,
            round_num,
        )
        return [dict(r) for r in rows]


async def fetch_race_strategy(year: int, round_num: int) -> list[dict]:
    """
    Fetch pit strategy stints. We join with drivers for name/team info,
    and aggregate stint + pit stop data per driver.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            WITH race_session AS (
                SELECT session_key
                FROM sessions
                WHERE year = $1
                    AND session_type = 'Race'
                ORDER BY date_start DESC
                LIMIT 1
            )
            SELECT
                ps.driver_number,
                COALESCE(d.name_acronym, 'UNK') AS name_acronym,
                COALESCE(d.team_name, 'Unknown') AS team_name,
                COALESCE(d.team_colour, '999999') AS team_colour,
                ps.stint_number,
                ps.compound,
                ps.lap_start,
                ps.lap_end,
                ps.stint_laps,
                ps.tyre_age_at_start,
                ps.pit_duration_seconds
            FROM pit_strategy ps
            JOIN race_session rs ON ps.session_key = rs.session_key
            LEFT JOIN drivers d
                ON ps.driver_number = d.driver_number
                AND d.session_key = rs.session_key
            WHERE ps.year = $1
            ORDER BY ps.driver_number, ps.stint_number
            """,
            year,
        )
        return [dict(r) for r in rows]
