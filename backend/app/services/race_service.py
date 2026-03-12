from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import races as race_queries

settings = get_settings()


@cached(prefix="seasons", ttl=settings.cache_ttl_seasons, key_builder=lambda: "all")
async def get_seasons() -> dict:
    years = await race_queries.fetch_seasons()
    return {"seasons": years}


@cached(
    prefix="season_races",
    ttl=settings.cache_ttl_race,
    key_builder=lambda year: str(year),
)
async def get_season_races(year: int) -> dict:
    rows = await race_queries.fetch_season_races(year)
    races = []
    for r in rows:
        races.append({
            "session_key": r["session_key"],
            "year": r["year"],
            "round": r.get("round") or 0,
            "country_name": r.get("country_name") or "",
            "country_code": r.get("country_code"),
            "circuit_short_name": r.get("circuit_short_name") or "",
            "location": r.get("location") or "",
            "date_start": str(r["date_start"]) if r.get("date_start") else "",
            "session_type": r.get("session_type") or "Race",
            "session_name": r.get("session_name") or "Race",
            "winner_name": r.get("winner_name"),
            "winner_team": r.get("winner_team"),
            "winner_team_colour": r.get("winner_team_colour"),
        })
    return {"year": year, "races": races}


@cached(
    prefix="session",
    ttl=settings.cache_ttl_race,
    key_builder=lambda session_key: str(session_key),
)
async def get_session_detail(session_key: int) -> dict | None:
    row = await race_queries.fetch_session_detail(session_key)
    if row is None:
        return None
    row["date_start"] = str(row["date_start"]) if row.get("date_start") else None
    row["date_end"] = str(row["date_end"]) if row.get("date_end") else None
    return row


@cached(
    prefix="race_summary",
    ttl=settings.cache_ttl_race,
    key_builder=lambda year, round_num: f"{year}:{round_num}",
)
async def get_race_summary(year: int, round_num: int) -> dict | None:
    row = await race_queries.fetch_race_summary(year, round_num)
    if row is None:
        return None

    # Build race_name from country_name + "Grand Prix"
    country = row.get("country_name") or "Unknown"
    race_name = f"{country} Grand Prix"

    return {
        "year": row["year"],
        "round": row["round"],
        "race_name": race_name,
        "circuit_short_name": row.get("circuit_short_name") or "",
        "country_name": country,
        "date": str(row["date_start"]) if row.get("date_start") else "",
        "total_laps": row.get("total_laps") or 0,
        "safety_car_count": row.get("safety_car_events") or 0,
        "red_flag_count": row.get("red_flag_count") or 0,
        "winner": {
            "driver_number": row.get("winner_driver_number"),
            "full_name": row.get("winner_full_name") or row.get("winner_name") or "Unknown",
            "name_acronym": row.get("winner_acronym") or row.get("winner_code") or "UNK",
            "team_name": row.get("winner_team") or "Unknown",
            "team_colour": row.get("winner_team_colour") or "999999",
        },
    }


@cached(
    prefix="race_results",
    ttl=settings.cache_ttl_race,
    key_builder=lambda year, round_num: f"{year}:{round_num}",
)
async def get_race_results(year: int, round_num: int) -> dict:
    rows = await race_queries.fetch_race_results(year, round_num)
    results = []
    for r in rows:
        results.append({
            "position": r.get("position"),
            "driver_number": r.get("driver_number"),
            "full_name": r.get("full_name") or "Unknown",
            "name_acronym": r.get("name_acronym") or "UNK",
            "team_name": r.get("team_name") or "Unknown",
            "team_colour": r.get("team_colour") or "999999",
            "grid": r.get("grid"),
            "positions_gained": r.get("positions_gained"),
            "points": r.get("points") or 0.0,
            "status": r.get("status"),
            "total_time": r.get("total_time"),
            "fastest_lap_time": r.get("fastest_lap_time"),
            "pit_count": r.get("pit_count") or 0,
            "headshot_url": r.get("headshot_url"),
        })
    return {"results": results}


@cached(
    prefix="race_strategy",
    ttl=settings.cache_ttl_race,
    key_builder=lambda year, round_num: f"{year}:{round_num}",
)
async def get_race_strategy(year: int, round_num: int) -> dict:
    rows = await race_queries.fetch_race_strategy(year, round_num)

    # Group stints by driver
    drivers: dict[int, dict] = {}
    for r in rows:
        dn = r["driver_number"]
        if dn not in drivers:
            drivers[dn] = {
                "driver_number": dn,
                "name_acronym": r["name_acronym"],
                "team_name": r["team_name"],
                "team_colour": r["team_colour"],
                "stints": [],
                "pit_stops": [],
            }

        drivers[dn]["stints"].append({
            "stint_number": r["stint_number"],
            "compound": r.get("compound") or "UNKNOWN",
            "lap_start": r.get("lap_start") or 0,
            "lap_end": r.get("lap_end") or 0,
            "stint_laps": r.get("stint_laps") or 0,
            "tyre_age_at_start": r.get("tyre_age_at_start") or 0,
        })

        # If there's a pit duration, this stint ended with a pit stop
        pit_dur = r.get("pit_duration_seconds")
        if pit_dur is not None and r.get("lap_end") is not None:
            drivers[dn]["pit_stops"].append({
                "lap_number": r["lap_end"],
                "pit_duration": pit_dur,
            })

    return {"strategies": list(drivers.values())}
