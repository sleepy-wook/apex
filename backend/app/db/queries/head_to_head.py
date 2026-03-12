from app.db.connection import get_pool


async def fetch_head_to_head(year: int, constructor_id: str) -> dict | None:
    """
    Fetch head-to-head data for a team in a given year.
    The head_to_head table stores per-round rows; we aggregate here.
    """
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT h.*,
                   COALESCE(d.team_colour, '999999') AS team_colour
            FROM head_to_head h
            LEFT JOIN LATERAL (
                SELECT team_colour
                FROM drivers
                WHERE team_name = h.constructor_name AND year = h.year
                ORDER BY session_key DESC
                LIMIT 1
            ) d ON TRUE
            WHERE h.year = $1 AND h.constructor_id = $2
            ORDER BY h.round
            """,
            year,
            constructor_id,
        )
        if not rows:
            return None

        # Aggregate across rounds
        first = dict(rows[0])
        team_name = first.get("constructor_name", constructor_id)
        team_colour = first.get("team_colour", "999999")

        d1_id = first["driver1_id"]
        d1_code = first.get("driver1_code", "???")
        d2_id = first["driver2_id"]
        d2_code = first.get("driver2_code", "???")

        d1_quali_wins = 0
        d1_race_wins = 0
        d1_positions = []
        d1_total_points = 0.0

        d2_quali_wins = 0
        d2_race_wins = 0
        d2_positions = []
        d2_total_points = 0.0

        for r in rows:
            row = dict(r)
            # Race winner tracking
            winner = row.get("race_winner")
            if winner == d1_id:
                d1_race_wins += 1
            elif winner == d2_id:
                d2_race_wins += 1

            # Qualifying: lower position = better (driver with lower pos wins)
            p1 = row.get("driver1_position")
            p2 = row.get("driver2_position")
            if p1 is not None and p2 is not None:
                if p1 < p2:
                    d1_quali_wins += 1
                elif p2 < p1:
                    d2_quali_wins += 1

            if p1 is not None:
                d1_positions.append(p1)
            if p2 is not None:
                d2_positions.append(p2)

            d1_total_points += row.get("driver1_points", 0) or 0
            d2_total_points += row.get("driver2_points", 0) or 0

        d1_avg = round(sum(d1_positions) / len(d1_positions), 1) if d1_positions else 0.0
        d2_avg = round(sum(d2_positions) / len(d2_positions), 1) if d2_positions else 0.0

        # Build driver full names from driver_id (e.g. "max_verstappen" -> "Max Verstappen")
        def id_to_name(did: str, code: str) -> str:
            parts = did.replace("_", " ").split()
            if len(parts) >= 2:
                return parts[0].capitalize() + " " + " ".join(p.upper() for p in parts[1:])
            return code

        return {
            "year": year,
            "team_name": team_name,
            "team_colour": team_colour,
            "driver_1": {
                "name_acronym": d1_code,
                "full_name": id_to_name(d1_id, d1_code),
                "qualifying_wins": d1_quali_wins,
                "race_wins": d1_race_wins,
                "avg_position": d1_avg,
                "total_points": d1_total_points,
            },
            "driver_2": {
                "name_acronym": d2_code,
                "full_name": id_to_name(d2_id, d2_code),
                "qualifying_wins": d2_quali_wins,
                "race_wins": d2_race_wins,
                "avg_position": d2_avg,
                "total_points": d2_total_points,
            },
        }
