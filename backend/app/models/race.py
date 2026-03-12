from pydantic import BaseModel


# --- Race List ---

class RaceListItem(BaseModel):
    session_key: int
    year: int
    round: int
    country_name: str
    country_code: str | None = None
    circuit_short_name: str
    location: str
    date_start: str
    session_type: str
    session_name: str
    winner_name: str | None = None
    winner_team: str | None = None
    winner_team_colour: str | None = None


class SeasonRacesResponse(BaseModel):
    year: int
    races: list[RaceListItem]


# --- Race Summary ---

class WinnerInfo(BaseModel):
    driver_number: int | None = None
    full_name: str
    name_acronym: str
    team_name: str
    team_colour: str


class RaceSummaryResponse(BaseModel):
    year: int
    round: int
    race_name: str
    circuit_short_name: str
    country_name: str
    date: str
    total_laps: int
    safety_car_count: int
    red_flag_count: int
    winner: WinnerInfo


# --- Race Results ---

class DriverRaceResult(BaseModel):
    position: int | None = None
    driver_number: int | None = None
    full_name: str
    name_acronym: str
    team_name: str
    team_colour: str
    grid: int | None = None
    positions_gained: int | None = None
    points: float = 0.0
    status: str | None = None
    total_time: str | None = None
    fastest_lap_time: str | None = None
    pit_count: int = 0
    headshot_url: str | None = None


class RaceResultsResponse(BaseModel):
    results: list[DriverRaceResult]


# --- Lap Data ---

class LapData(BaseModel):
    driver_number: int
    name_acronym: str
    team_colour: str
    lap_number: int
    lap_duration: float | None = None
    sector_1: float | None = None
    sector_2: float | None = None
    sector_3: float | None = None
    compound: str | None = None
    tyre_age: int = 0
    is_pit_out_lap: bool = False


class LapsResponse(BaseModel):
    laps: list[LapData]


# --- Position Data ---

class LapPosition(BaseModel):
    lap: int
    position: int


class PositionData(BaseModel):
    driver_number: int
    name_acronym: str
    team_colour: str
    laps: list[LapPosition]


class PositionsResponse(BaseModel):
    positions: list[PositionData]


# --- Session Detail ---

class SessionDetail(BaseModel):
    session_key: int
    year: int
    session_name: str | None = None
    session_type: str | None = None
    circuit_short_name: str | None = None
    country_name: str | None = None
    country_code: str | None = None
    location: str | None = None
    date_start: str | None = None
    date_end: str | None = None
