export interface DriverStanding {
  position: number;
  driver_id: string;
  driver_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  points: number;
  wins: number;
}

export interface ConstructorStanding {
  position: number;
  constructor_id: string;
  constructor_name: string;
  team_colour: string;
  points: number;
  wins: number;
}

export interface StandingsProgression {
  driver_id: string;
  name_acronym: string;
  team_colour: string;
  rounds: { round: number; points: number }[];
}
