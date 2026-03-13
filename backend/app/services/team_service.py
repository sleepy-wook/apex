from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import teams as team_queries

settings = get_settings()


@cached(
    prefix="teams",
    ttl=settings.cache_ttl_standings,
    key_builder=lambda year: str(year),
)
async def get_teams(year: int) -> dict:
    data = await team_queries.fetch_teams(year)
    target_round = data["round"]
    constructors = data["constructors"]
    drivers = data["drivers"]
    team_details_list = data.get("team_details", [])

    # Build team_details lookup by team_name
    details_map: dict[str, dict] = {}
    for td in team_details_list:
        details_map[td.get("team_name", "")] = td

    # Group drivers by constructor_name
    driver_map: dict[str, list[dict]] = {}
    for d in drivers:
        team = d.get("constructor_name") or "Unknown"
        if team not in driver_map:
            driver_map[team] = []
        driver_map[team].append({
            "driver_name": d.get("driver_name") or "Unknown",
            "name_acronym": d.get("name_acronym") or "UNK",
            "driver_number": d.get("driver_number"),
            "points": d.get("points") or 0.0,
            "driver_position": d.get("driver_position"),
            "headshot_url": d.get("headshot_url"),
        })

    teams = []
    for c in constructors:
        name = c.get("constructor_name") or "Unknown"
        detail = details_map.get(name, {})
        teams.append({
            "position": c.get("position") or 0,
            "constructor_id": c.get("constructor_id") or "",
            "constructor_name": name,
            "team_colour": c.get("team_colour") or "999999",
            "points": c.get("points") or 0.0,
            "wins": c.get("wins") or 0,
            "drivers": driver_map.get(name, []),
            "full_name": detail.get("full_name"),
            "base_city": detail.get("base_city"),
            "base_country": detail.get("base_country"),
            "founded_year": detail.get("founded_year"),
            "engine_supplier": detail.get("engine_supplier"),
            "team_principal": detail.get("team_principal"),
            "world_championships": detail.get("world_championships"),
        })

    return {"year": year, "round": target_round, "teams": teams}
