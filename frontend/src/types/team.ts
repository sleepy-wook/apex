export interface TeamDriver {
  driver_name: string;
  name_acronym: string;
  driver_number: number | null;
  points: number;
  driver_position: number | null;
  headshot_url: string | null;
}

export interface Team {
  position: number;
  constructor_id: string;
  constructor_name: string;
  team_colour: string;
  points: number;
  wins: number;
  drivers: TeamDriver[];
  // Detail fields from team_details seed table
  full_name: string | null;
  base_city: string | null;
  base_country: string | null;
  founded_year: number | null;
  engine_supplier: string | null;
  team_principal: string | null;
  world_championships: number | null;
}
