export interface Circuit {
  circuit_key: number;
  circuit_short_name: string;
  circuit_full_name: string | null;
  country_name: string | null;
  country_code: string | null;
  city: string | null;
  track_length_km: number | null;
  turns: number | null;
  drs_zones: number | null;
  first_gp_year: number | null;
  lap_record_time: string | null;
  lap_record_driver: string | null;
  lap_record_year: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface CircuitPastRace {
  year: number;
  round: number | null;
  winner_name: string | null;
  winner_team: string | null;
  total_laps: number | null;
  date_start: string | null;
}

export interface CircuitDetail extends Circuit {
  past_races: CircuitPastRace[];
}
