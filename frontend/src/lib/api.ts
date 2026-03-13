import type {
  RaceSummary,
  DriverRaceResult,
  LapData,
  PositionData,
  PitStrategy,
  RaceListItem,
} from "@/types/race";
import type {
  DriverStanding,
  ConstructorStanding,
  StandingsProgression,
} from "@/types/standing";
import type { Driver, HeadToHead } from "@/types/driver";
import type { ScheduleEvent } from "@/types/schedule";
import type { Team } from "@/types/team";
import type { Circuit, CircuitDetail } from "@/types/circuit";

// ---------------------------------------------------------------------------
// Base URL — reads from env at build time (Next.js public env)
// ---------------------------------------------------------------------------

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

interface FetchOptions extends Omit<RequestInit, "method"> {
  params?: Record<string, string | number | boolean | undefined>;
}

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...init } = options;

  // Build URL with query parameters
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body.detail) {
        detail = body.detail;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new ApiError(response.status, detail);
  }

  return response.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Seasons & Races
// ---------------------------------------------------------------------------

/** Available seasons list */
export async function getSeasons(): Promise<{ seasons: number[] }> {
  return apiFetch("/seasons");
}

/** All races in a season */
export async function getRaces(
  year: number,
): Promise<{ year: number; races: RaceListItem[] }> {
  return apiFetch(`/seasons/${year}/races`);
}

// ---------------------------------------------------------------------------
// Race detail endpoints
// ---------------------------------------------------------------------------

/** Race summary (winner, SC count, total laps, etc.) */
export async function getRaceSummary(
  year: number,
  round: number,
): Promise<RaceSummary> {
  return apiFetch(`/races/${year}/${round}/summary`);
}

/** Driver-level race results ordered by finishing position */
export async function getRaceResults(
  year: number,
  round: number,
): Promise<{ results: DriverRaceResult[] }> {
  return apiFetch(`/races/${year}/${round}/results`);
}

/** Lap-by-lap timing data, optionally filtered by driver */
export async function getLaps(
  year: number,
  round: number,
  driverNumber?: number,
): Promise<{ laps: LapData[] }> {
  return apiFetch(`/races/${year}/${round}/laps`, {
    params: { driver_number: driverNumber },
  });
}

/** Lap-by-lap position changes for the position chart */
export async function getPositions(
  year: number,
  round: number,
): Promise<{ positions: PositionData[] }> {
  return apiFetch(`/races/${year}/${round}/positions`);
}

/** Pit strategy — stints + pit stops per driver */
export async function getStrategy(
  year: number,
  round: number,
): Promise<{ strategies: PitStrategy[] }> {
  return apiFetch(`/races/${year}/${round}/strategy`);
}

// ---------------------------------------------------------------------------
// Standings
// ---------------------------------------------------------------------------

/** Driver championship standings (latest round by default) */
export async function getDriverStandings(
  year: number,
  round?: number,
): Promise<{
  year: number;
  round: number;
  standings: DriverStanding[];
}> {
  return apiFetch(`/standings/drivers/${year}`, {
    params: { round },
  });
}

/** Constructor championship standings */
export async function getConstructorStandings(
  year: number,
  round?: number,
): Promise<{
  year: number;
  round: number;
  standings: ConstructorStanding[];
}> {
  return apiFetch(`/standings/constructors/${year}`, {
    params: { round },
  });
}

/** Points progression across rounds (for line chart) */
export async function getDriverStandingsProgression(
  year: number,
): Promise<{ progression: StandingsProgression[] }> {
  return apiFetch(`/standings/drivers/${year}/progression`);
}

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------

/** Current season driver list */
export async function getDrivers(
  year?: number,
): Promise<{ drivers: Driver[] }> {
  return apiFetch("/drivers", { params: { year } });
}

/** Single driver detail + season stats */
export async function getDriver(
  driverNumber: number,
  year?: number,
): Promise<Driver> {
  return apiFetch(`/drivers/${driverNumber}`, { params: { year } });
}

// ---------------------------------------------------------------------------
// Head-to-Head
// ---------------------------------------------------------------------------

/** Teammate head-to-head comparison */
export async function getHeadToHead(
  year: number,
  constructorId: string,
): Promise<HeadToHead> {
  return apiFetch(`/head-to-head/${year}/${constructorId}`);
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

/** Full season schedule with all sessions (FP1~Race) grouped by event */
export async function getSchedule(
  year: number,
): Promise<{ year: number; events: ScheduleEvent[] }> {
  return apiFetch(`/schedule/${year}`);
}

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------

/** Team list with constructor standings + drivers */
export async function getTeams(
  year: number,
): Promise<{ year: number; round: number; teams: Team[] }> {
  return apiFetch(`/teams/${year}`);
}

// ---------------------------------------------------------------------------
// Circuits
// ---------------------------------------------------------------------------

/** All circuits list */
export async function getCircuits(): Promise<{ circuits: Circuit[] }> {
  return apiFetch("/circuits");
}

/** Circuit detail with past race history */
export async function getCircuitDetail(
  circuitKey: number,
): Promise<CircuitDetail> {
  return apiFetch(`/circuits/${circuitKey}`);
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

/** Server health check */
export async function getHealth(): Promise<{ status: string }> {
  return apiFetch("/health");
}
