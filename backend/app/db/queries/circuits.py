from app.db.connection import get_pool


async def fetch_circuits() -> list[dict]:
    """Fetch all circuits with basic info."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            rows = await conn.fetch(
                """
                SELECT
                    c.circuit_key,
                    c.circuit_short_name,
                    c.circuit_full_name,
                    c.country_name,
                    c.country_code,
                    c.city,
                    c.track_length_km,
                    c.turns,
                    c.drs_zones,
                    c.first_gp_year,
                    c.lap_record_time,
                    c.lap_record_driver,
                    c.lap_record_year,
                    c.latitude,
                    c.longitude
                FROM circuits c
                ORDER BY c.country_name, c.circuit_short_name
                """
            )
            return [dict(r) for r in rows]
        except Exception:
            # circuits table may not exist yet (seed data)
            return []


async def fetch_circuit_detail(circuit_key: int) -> dict | None:
    """Fetch a single circuit with its recent race history."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            return await _fetch_circuit_detail_impl(conn, circuit_key)
        except Exception:
            # circuits table may not exist yet (seed data)
            return None


async def _fetch_circuit_detail_impl(conn, circuit_key: int) -> dict | None:
    """Internal implementation for circuit detail fetch."""
    row = await conn.fetchrow(
        """
        SELECT
            c.circuit_key,
            c.circuit_short_name,
            c.circuit_full_name,
            c.country_name,
            c.country_code,
            c.city,
            c.track_length_km,
            c.turns,
            c.drs_zones,
            c.first_gp_year,
            c.lap_record_time,
            c.lap_record_driver,
            c.lap_record_year,
            c.latitude,
            c.longitude
        FROM circuits c
        WHERE c.circuit_key = $1
        """,
        circuit_key,
    )
    if row is None:
        return None

    circuit = dict(row)

    races = await conn.fetch(
        """
        SELECT
            rs.year,
            rs.round,
            rs.winner_name,
            rs.winner_team,
            rs.total_laps,
            rs.date_start
        FROM race_summary rs
        JOIN sessions s ON rs.session_key = s.session_key
        WHERE s.circuit_key = $1
        ORDER BY rs.year DESC
        LIMIT 10
        """,
        circuit_key,
    )

    circuit["past_races"] = [dict(r) for r in races]
    return circuit
