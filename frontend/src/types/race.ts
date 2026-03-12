export interface RaceSummary {
  year: number;
  round: number;
  race_name: string;
  circuit_short_name: string;
  country_name: string;
  date: string;
  total_laps: number;
  safety_car_count: number;
  red_flag_count: number;
  winner: {
    driver_number: number;
    full_name: string;
    name_acronym: string;
    team_name: string;
    team_colour: string;
  };
}

export interface DriverRaceResult {
  position: number;
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  grid: number;
  positions_gained: number;
  points: number;
  status: string;
  total_time: string | null;
  fastest_lap_time: string | null;
  pit_count: number;
  headshot_url: string | null;
}

export interface LapData {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  lap_number: number;
  lap_duration: number | null;
  sector_1: number | null;
  sector_2: number | null;
  sector_3: number | null;
  compound: TyreCompound;
  tyre_age: number;
  is_pit_out_lap: boolean;
}

export interface PositionData {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  laps: { lap: number; position: number }[];
}

export interface PitStrategy {
  driver_number: number;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  stints: Stint[];
  pit_stops: PitStop[];
}

export interface Stint {
  stint_number: number;
  compound: TyreCompound;
  lap_start: number;
  lap_end: number;
  stint_laps: number;
  tyre_age_at_start: number;
}

export interface PitStop {
  lap_number: number;
  pit_duration: number;
}

export type TyreCompound =
  | "SOFT"
  | "MEDIUM"
  | "HARD"
  | "INTERMEDIATE"
  | "WET";

export interface RaceListItem {
  session_key: number;
  year: number;
  round: number;
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  location: string;
  date_start: string;
  session_type: string;
  session_name: string;
  winner_name: string | null;
  winner_team: string | null;
  winner_team_colour: string | null;
}
