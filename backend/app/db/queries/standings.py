from app.db.connection import get_pool


async def fetch_driver_standings(year: int, round_num: int | None = None) -> tuple[int, list[dict]]:
    """Returns (round, standings_list)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        if round_num is not None:
            target_round = round_num
        else:
            row = await conn.fetchrow(
                "SELECT MAX(round) AS max_round FROM driver_standings WHERE year = $1",
                year,
            )
            target_round = row["max_round"] if row and row["max_round"] else 0

        rows = await conn.fetch(
            """
            SELECT
                ds.position,
                ds.driver_id,
                CONCAT(ds.driver_given_name, ' ', UPPER(ds.driver_family_name)) AS driver_name,
                COALESCE(ds.driver_code, 'UNK') AS name_acronym,
                COALESCE(ds.constructor_name, 'Unknown') AS team_name,
                COALESCE(d.team_colour, '999999') AS team_colour,
                ds.points,
                ds.wins
            FROM driver_standings ds
            LEFT JOIN LATERAL (
                SELECT team_colour
                FROM drivers
                WHERE name_acronym = ds.driver_code AND year = ds.year
                ORDER BY session_key DESC
                LIMIT 1
            ) d ON TRUE
            WHERE ds.year = $1 AND ds.round = $2
            ORDER BY ds.position
            """,
            year,
            target_round,
        )
        return target_round, [dict(r) for r in rows]


async def fetch_constructor_standings(year: int, round_num: int | None = None) -> tuple[int, list[dict]]:
    """Returns (round, standings_list)."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        if round_num is not None:
            target_round = round_num
        else:
            row = await conn.fetchrow(
                "SELECT MAX(round) AS max_round FROM constructor_standings WHERE year = $1",
                year,
            )
            target_round = row["max_round"] if row and row["max_round"] else 0

        rows = await conn.fetch(
            """
            SELECT
                cs.position,
                cs.constructor_id,
                cs.constructor_name,
                COALESCE(d.team_colour, '999999') AS team_colour,
                cs.points,
                cs.wins
            FROM constructor_standings cs
            LEFT JOIN LATERAL (
                SELECT team_colour
                FROM drivers
                WHERE team_name = cs.constructor_name AND year = cs.year
                ORDER BY session_key DESC
                LIMIT 1
            ) d ON TRUE
            WHERE cs.year = $1 AND cs.round = $2
            ORDER BY cs.position
            """,
            year,
            target_round,
        )
        return target_round, [dict(r) for r in rows]


async def fetch_driver_standings_progression(year: int) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT
                ds.driver_id,
                COALESCE(ds.driver_code, 'UNK') AS name_acronym,
                COALESCE(d.team_colour, '999999') AS team_colour,
                ds.round,
                ds.points
            FROM driver_standings ds
            LEFT JOIN LATERAL (
                SELECT team_colour
                FROM drivers
                WHERE name_acronym = ds.driver_code AND year = ds.year
                ORDER BY session_key DESC
                LIMIT 1
            ) d ON TRUE
            WHERE ds.year = $1
            ORDER BY ds.driver_id, ds.round
            """,
            year,
        )
        return [dict(r) for r in rows]
