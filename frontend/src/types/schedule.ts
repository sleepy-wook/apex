export interface SessionInfo {
  session_key: number;
  session_name: string | null;
  session_type: string | null;
  date_start: string | null;
  date_end: string | null;
}

export interface ScheduleEvent {
  round: number | null;
  circuit_key: number | null;
  circuit_short_name: string;
  country_name: string;
  country_code: string | null;
  location: string | null;
  gmt_offset: string | null;
  sessions: SessionInfo[];
  winner_name: string | null;
  winner_team: string | null;
  winner_team_colour: string | null;
}
