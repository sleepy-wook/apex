"use client";

import { useEffect, useState } from "react";
import { LapTimeChart } from "@/components/charts/LapTimeChart";
import type { LapData } from "@/types/race";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface LapTimeChartSectionProps {
  year: number;
  round: number;
}

export function LapTimeChartSection({ year, round }: LapTimeChartSectionProps) {
  const [laps, setLaps] = useState<LapData[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/races/${year}/${round}/laps`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setLaps(data.laps))
      .catch(() => setError(true));
  }, [year, round]);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        랩 타임 데이터를 불러올 수 없습니다.
      </p>
    );
  }

  if (!laps) {
    return <div className="animate-pulse bg-muted rounded w-full h-[350px]" />;
  }

  // Extract unique drivers
  const driverMap = new Map<
    number,
    { number: number; acronym: string; teamColour: string }
  >();
  for (const lap of laps) {
    if (!driverMap.has(lap.driver_number)) {
      driverMap.set(lap.driver_number, {
        number: lap.driver_number,
        acronym: lap.name_acronym,
        teamColour: lap.team_colour,
      });
    }
  }

  return (
    <LapTimeChart
      laps={laps}
      drivers={Array.from(driverMap.values())}
      className="w-full"
    />
  );
}
