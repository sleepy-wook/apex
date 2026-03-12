export interface Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string | null;
}

export interface HeadToHead {
  year: number;
  team_name: string;
  team_colour: string;
  driver_1: HeadToHeadDriver;
  driver_2: HeadToHeadDriver;
}

export interface HeadToHeadDriver {
  name_acronym: string;
  full_name: string;
  qualifying_wins: number;
  race_wins: number;
  avg_position: number;
  total_points: number;
}
