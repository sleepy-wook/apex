from app.db.connection import get_pool


async def fetch_schedule(year: int) -> list[dict]:
    """
    Fetch all sessions for a year, joined with race_summary for round/winner info.
    Groups by circuit_key to form GP events.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                s.session_key,
                s.year,
                s.session_name,
                s.session_type,
                s.circuit_key,
                s.circuit_short_name,
                s.country_name,
                s.country_code,
                s.location,
                s.date_start,
                s.date_end,
                s.gmt_offset,
                rs.round,
                rs.winner_name,
                rs.winner_team,
                d.team_colour AS winner_team_colour
            FROM sessions s
            LEFT JOIN race_summary rs
                ON s.session_key = rs.session_key
            LEFT JOIN drivers d
                ON d.driver_number = (
                    SELECT drr.driver_number
                    FROM driver_race_result drr
                    WHERE drr.year = rs.year AND drr.round = rs.round AND drr.position = 1
                    LIMIT 1
                )
                AND d.session_key = s.session_key
            WHERE s.year = $1
            ORDER BY s.date_start
            """,
            year,
        )
        return [dict(r) for r in rows]
