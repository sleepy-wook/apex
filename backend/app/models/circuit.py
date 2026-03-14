from pydantic import BaseModel


class CircuitListItem(BaseModel):
    circuit_key: int
    circuit_short_name: str
    circuit_full_name: str | None = None
    country_name: str | None = None
    country_code: str | None = None
    city: str | None = None
    track_length_km: float | None = None
    turns: int | None = None
    drs_zones: int | None = None
    first_gp_year: int | None = None
    lap_record_time: str | None = None
    lap_record_driver: str | None = None
    lap_record_year: int | None = None
    latitude: float | None = None
    longitude: float | None = None
    track_map_url: str | None = None


class CircuitsResponse(BaseModel):
    circuits: list[CircuitListItem]


class CircuitPastRace(BaseModel):
    year: int
    round: int | None = None
    winner_name: str | None = None
    winner_team: str | None = None
    total_laps: int | None = None
    date_start: str | None = None


class CircuitDetailResponse(CircuitListItem):
    past_races: list[CircuitPastRace] = []
