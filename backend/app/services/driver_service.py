from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import drivers as driver_queries
from app.db.queries import head_to_head as h2h_queries

settings = get_settings()


@cached(
    prefix="drivers",
    ttl=settings.cache_ttl_drivers,
    key_builder=lambda year=None: str(year or "current"),
)
async def get_drivers(year: int | None = None) -> dict:
    rows = await driver_queries.fetch_drivers(year)
    drivers = []
    for r in rows:
        drivers.append({
            "driver_number": r["driver_number"],
            "full_name": r.get("full_name") or "Unknown",
            "name_acronym": r.get("name_acronym") or "UNK",
            "team_name": r.get("team_name") or "Unknown",
            "team_colour": r.get("team_colour") or "999999",
            "first_name": r.get("first_name"),
            "last_name": r.get("last_name"),
            "headshot_url": r.get("headshot_url"),
            "country_code": r.get("country_code"),
        })
    return {"drivers": drivers}


@cached(
    prefix="driver_detail",
    ttl=settings.cache_ttl_drivers,
    key_builder=lambda driver_number, year=None: f"{driver_number}:{year or 'current'}",
)
async def get_driver_detail(driver_number: int, year: int | None = None) -> dict | None:
    r = await driver_queries.fetch_driver_detail(driver_number, year)
    if r is None:
        return None
    return {
        "driver_number": r["driver_number"],
        "full_name": r.get("full_name") or "Unknown",
        "name_acronym": r.get("name_acronym") or "UNK",
        "team_name": r.get("team_name") or "Unknown",
        "team_colour": r.get("team_colour") or "999999",
        "first_name": r.get("first_name"),
        "last_name": r.get("last_name"),
        "headshot_url": r.get("headshot_url"),
        "country_code": r.get("country_code"),
    }


@cached(
    prefix="head_to_head",
    ttl=settings.cache_ttl_standings,
    key_builder=lambda year, constructor_id: f"{year}:{constructor_id}",
)
async def get_head_to_head(year: int, constructor_id: str) -> dict | None:
    return await h2h_queries.fetch_head_to_head(year, constructor_id)
