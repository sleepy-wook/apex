from datetime import datetime

from app.db.connection import get_pool


async def fetch_drivers(year: int | None = None) -> list[dict]:
    pool = await get_pool()
    if year is None:
        year = datetime.now().year

    async with pool.acquire() as conn:
        # Get the latest session_key per driver for the year to avoid duplicates
        rows = await conn.fetch(
            """
            SELECT DISTINCT ON (driver_number)
                driver_number,
                full_name,
                name_acronym,
                team_name,
                team_colour,
                broadcast_name,
                headshot_url,
                country_code
            FROM drivers
            WHERE year = $1
            ORDER BY driver_number, session_key DESC
            """,
            year,
        )
        result = []
        for r in rows:
            d = dict(r)
            # Parse first_name / last_name from full_name (e.g. "Lando NORRIS")
            parts = (d.get("full_name") or "").split(" ", 1)
            d["first_name"] = parts[0] if parts else None
            d["last_name"] = parts[1] if len(parts) > 1 else None
            result.append(d)
        return result


async def fetch_driver_detail(driver_number: int, year: int | None = None) -> dict | None:
    pool = await get_pool()
    if year is None:
        year = datetime.now().year

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT DISTINCT ON (driver_number)
                driver_number,
                full_name,
                name_acronym,
                team_name,
                team_colour,
                broadcast_name,
                headshot_url,
                country_code
            FROM drivers
            WHERE driver_number = $1 AND year = $2
            ORDER BY driver_number, session_key DESC
            """,
            driver_number,
            year,
        )
        if row is None:
            return None
        d = dict(row)
        parts = (d.get("full_name") or "").split(" ", 1)
        d["first_name"] = parts[0] if parts else None
        d["last_name"] = parts[1] if len(parts) > 1 else None
        return d
