from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import standings as standing_queries

settings = get_settings()


@cached(
    prefix="driver_standings",
    ttl=settings.cache_ttl_standings,
    key_builder=lambda year, round_num=None: f"{year}:{round_num or 'latest'}",
)
async def get_driver_standings(year: int, round_num: int | None = None) -> dict:
    actual_round, rows = await standing_queries.fetch_driver_standings(year, round_num)
    standings = []
    for r in rows:
        standings.append({
            "position": r["position"],
            "driver_id": r["driver_id"],
            "driver_name": r.get("driver_name") or r["driver_id"],
            "name_acronym": r.get("name_acronym") or "UNK",
            "team_name": r.get("team_name") or "Unknown",
            "team_colour": r.get("team_colour") or "999999",
            "points": r.get("points") or 0.0,
            "wins": r.get("wins") or 0,
        })
    return {"year": year, "round": actual_round, "standings": standings}


@cached(
    prefix="constructor_standings",
    ttl=settings.cache_ttl_standings,
    key_builder=lambda year, round_num=None: f"{year}:{round_num or 'latest'}",
)
async def get_constructor_standings(year: int, round_num: int | None = None) -> dict:
    actual_round, rows = await standing_queries.fetch_constructor_standings(year, round_num)
    standings = []
    for r in rows:
        standings.append({
            "position": r["position"],
            "constructor_id": r["constructor_id"],
            "constructor_name": r.get("constructor_name") or r["constructor_id"],
            "team_colour": r.get("team_colour") or "999999",
            "points": r.get("points") or 0.0,
            "wins": r.get("wins") or 0,
        })
    return {"year": year, "round": actual_round, "standings": standings}


@cached(
    prefix="standings_progression",
    ttl=settings.cache_ttl_standings,
    key_builder=lambda year: str(year),
)
async def get_standings_progression(year: int) -> dict:
    rows = await standing_queries.fetch_driver_standings_progression(year)

    # Group by driver
    drivers: dict[str, dict] = {}
    for r in rows:
        did = r["driver_id"]
        if did not in drivers:
            drivers[did] = {
                "driver_id": did,
                "name_acronym": r.get("name_acronym") or "UNK",
                "team_colour": r.get("team_colour") or "999999",
                "rounds": [],
            }
        drivers[did]["rounds"].append({
            "round": r["round"],
            "points": r.get("points") or 0.0,
        })

    return {"progression": list(drivers.values())}
