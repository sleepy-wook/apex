"use client";

import { useEffect, useState } from "react";
import { PositionChart } from "@/components/charts/PositionChart";
import type { PositionData } from "@/types/race";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

interface PositionChartSectionProps {
  year: number;
  round: number;
  totalLaps: number;
}

export function PositionChartSection({
  year,
  round,
  totalLaps,
}: PositionChartSectionProps) {
  const [positions, setPositions] = useState<PositionData[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/races/${year}/${round}/positions`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => setPositions(data.positions))
      .catch(() => setError(true));
  }, [year, round]);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        포지션 데이터를 불러올 수 없습니다.
      </p>
    );
  }

  if (!positions) {
    return <div className="animate-pulse bg-muted rounded w-full h-[400px]" />;
  }

  return (
    <PositionChart
      positions={positions}
      totalLaps={totalLaps}
      className="w-full"
    />
  );
}
