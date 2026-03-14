from app.cache.redis import cached
from app.config import get_settings
from app.db.queries import circuits as circuit_queries

settings = get_settings()


@cached(
    prefix="circuits",
    ttl=settings.cache_ttl_seasons,  # 7 days — static seed data
    key_builder=lambda: "all",
)
async def get_circuits() -> dict:
    rows = await circuit_queries.fetch_circuits()
    circuits = []
    for r in rows:
        circuits.append({
            "circuit_key": r["circuit_key"],
            "circuit_short_name": r.get("circuit_short_name") or "",
            "circuit_full_name": r.get("circuit_full_name"),
            "country_name": r.get("country_name"),
            "country_code": r.get("country_code"),
            "city": r.get("city"),
            "track_length_km": float(r["track_length_km"]) if r.get("track_length_km") else None,
            "turns": r.get("turns"),
            "drs_zones": r.get("drs_zones"),
            "first_gp_year": r.get("first_gp_year"),
            "lap_record_time": r.get("lap_record_time"),
            "lap_record_driver": r.get("lap_record_driver"),
            "lap_record_year": r.get("lap_record_year"),
            "latitude": float(r["latitude"]) if r.get("latitude") else None,
            "longitude": float(r["longitude"]) if r.get("longitude") else None,
            "track_map_url": r.get("track_map_url"),
        })
    return {"circuits": circuits}


@cached(
    prefix="circuit_detail",
    ttl=settings.cache_ttl_race,  # 24h — includes past race data
    key_builder=lambda circuit_key: str(circuit_key),
)
async def get_circuit_detail(circuit_key: int) -> dict | None:
    row = await circuit_queries.fetch_circuit_detail(circuit_key)
    if row is None:
        return None

    past_races = []
    for r in row.get("past_races", []):
        past_races.append({
            "year": r["year"],
            "round": r.get("round"),
            "winner_name": r.get("winner_name"),
            "winner_team": r.get("winner_team"),
            "total_laps": r.get("total_laps"),
            "date_start": str(r["date_start"]) if r.get("date_start") else None,
        })

    return {
        "circuit_key": row["circuit_key"],
        "circuit_short_name": row.get("circuit_short_name") or "",
        "circuit_full_name": row.get("circuit_full_name"),
        "country_name": row.get("country_name"),
        "country_code": row.get("country_code"),
        "city": row.get("city"),
        "track_length_km": float(row["track_length_km"]) if row.get("track_length_km") else None,
        "turns": row.get("turns"),
        "drs_zones": row.get("drs_zones"),
        "first_gp_year": row.get("first_gp_year"),
        "lap_record_time": row.get("lap_record_time"),
        "lap_record_driver": row.get("lap_record_driver"),
        "lap_record_year": row.get("lap_record_year"),
        "latitude": float(row["latitude"]) if row.get("latitude") else None,
        "longitude": float(row["longitude"]) if row.get("longitude") else None,
        "track_map_url": row.get("track_map_url"),
        "past_races": past_races,
    }
