from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import schedule as schedule_queries

settings = get_settings()


TESTING_SESSION_NAMES = {"Day 1", "Day 2", "Day 3"}


@cached(
    prefix="schedule",
    ttl=settings.cache_ttl_race,
    key_builder=lambda year: str(year),
)
async def get_schedule(year: int) -> dict:
    rows = await schedule_queries.fetch_schedule(year)

    # Filter out pre-season testing sessions
    race_rows = [
        r for r in rows
        if r.get("session_name") not in TESTING_SESSION_NAMES
    ]

    # Group sessions by circuit_key to form GP events
    events_map: dict[int, dict] = {}
    for r in race_rows:
        circuit_key = r.get("circuit_key") or 0
        if circuit_key not in events_map:
            events_map[circuit_key] = {
                "round": r.get("round"),
                "circuit_key": circuit_key,
                "circuit_short_name": r.get("circuit_short_name") or "",
                "country_name": r.get("country_name") or "",
                "country_code": r.get("country_code"),
                "location": r.get("location"),
                "gmt_offset": r.get("gmt_offset"),
                "sessions": [],
                "winner_name": r.get("winner_name"),
                "winner_team": r.get("winner_team"),
                "winner_team_colour": r.get("winner_team_colour"),
            }
        else:
            # Update round/winner info if this row has it (Race session)
            if r.get("round") and not events_map[circuit_key]["round"]:
                events_map[circuit_key]["round"] = r["round"]
            if r.get("winner_name") and not events_map[circuit_key]["winner_name"]:
                events_map[circuit_key]["winner_name"] = r["winner_name"]
                events_map[circuit_key]["winner_team"] = r.get("winner_team")
                events_map[circuit_key]["winner_team_colour"] = r.get("winner_team_colour")

        events_map[circuit_key]["sessions"].append({
            "session_key": r["session_key"],
            "session_name": r.get("session_name"),
            "session_type": r.get("session_type"),
            "date_start": str(r["date_start"]) if r.get("date_start") else None,
            "date_end": str(r["date_end"]) if r.get("date_end") else None,
        })

    # Sort events by the first session's date_start
    events = sorted(
        events_map.values(),
        key=lambda e: e["sessions"][0]["date_start"] or "",
    )

    # Assign round numbers based on date order if missing
    round_counter = 1
    for event in events:
        if not event["round"]:
            event["round"] = round_counter
        round_counter += 1

    return {"year": year, "events": events}
