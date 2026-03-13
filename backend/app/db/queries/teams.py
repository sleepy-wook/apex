from app.db.connection import get_pool


async def fetch_teams(year: int) -> list[dict]:
    """
    Fetch team info: constructor standings + drivers with headshots.
    Uses latest round's standings and matches drivers from the same year.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Get the latest round
        row = await conn.fetchrow(
            "SELECT MAX(round) AS max_round FROM constructor_standings WHERE year = $1",
            year,
        )
        target_round = row["max_round"] if row and row["max_round"] else 0

        # Fetch constructor standings with team color
        constructors = await conn.fetch(
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

        # Fetch drivers for each constructor (from driver_standings)
        drivers = await conn.fetch(
            """
            SELECT
                ds.constructor_name,
                CONCAT(ds.driver_given_name, ' ', UPPER(ds.driver_family_name)) AS driver_name,
                ds.points,
                ds.position AS driver_position,
                COALESCE(ds.driver_code, 'UNK') AS name_acronym,
                d.headshot_url,
                d.driver_number
            FROM driver_standings ds
            LEFT JOIN LATERAL (
                SELECT headshot_url, driver_number
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

        # Fetch team details (seed data) if available
        team_details: list = []
        try:
            team_details = await conn.fetch(
                """
                SELECT
                    team_name, full_name, base_city, base_country,
                    founded_year, engine_supplier, team_principal,
                    world_championships
                FROM team_details
                """
            )
        except Exception:
            # team_details table may not exist yet (seed data)
            pass

        return {
            "round": target_round,
            "constructors": [dict(c) for c in constructors],
            "drivers": [dict(d) for d in drivers],
            "team_details": [dict(td) for td in team_details],
        }
