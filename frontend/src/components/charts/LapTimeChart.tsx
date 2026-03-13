"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import type { LapData, TyreCompound } from "@/types/race";
import { formatLapTime, teamColorVar } from "@/lib/utils";

const COMPOUND_LABELS: Record<TyreCompound, string> = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
};

const COMPOUND_COLORS: Record<TyreCompound, string> = {
  SOFT: "#FF3333",
  MEDIUM: "#FFD700",
  HARD: "#F0F0F0",
  INTERMEDIATE: "#43B02A",
  WET: "#0072CE",
};

export interface LapTimeChartProps {
  laps: LapData[];
  drivers: { number: number; acronym: string; teamColour: string }[];
  /** Show a horizontal median lap time line */
  showMedian?: boolean;
  /** Filter out pit in/out laps from the main line (shown as markers instead) */
  filterPitLaps?: boolean;
  className?: string;
}

interface ChartRow {
  lap: number;
  [key: string]: number | string | null;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
        fontSize: "12px",
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Lap {label}
      </p>
      {payload.map((entry: any) => {
        const acronym = entry.dataKey as string;
        // Check for compound and tyre age data
        const compound = entry.payload[`${acronym}_compound`];
        const tyreAge = entry.payload[`${acronym}_tyreAge`];
        const isPit = entry.payload[`${acronym}_pit`];

        return (
          <div
            key={acronym}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 2,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: entry.stroke,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ color: entry.stroke, fontWeight: 600, minWidth: 32 }}>
              {acronym}
            </span>
            <span style={{ color: "var(--foreground)" }}>
              {formatLapTime(entry.value)}
            </span>
            {compound && (
              <span
                style={{
                  fontSize: 10,
                  padding: "1px 4px",
                  borderRadius: 3,
                  backgroundColor: COMPOUND_COLORS[compound as TyreCompound] || "#666",
                  color:
                    compound === "HARD" || compound === "MEDIUM" ? "#000" : "#fff",
                  fontWeight: 700,
                }}
              >
                {COMPOUND_LABELS[compound as TyreCompound] || compound}
              </span>
            )}
            {tyreAge != null && (
              <span style={{ color: "var(--muted-foreground)", fontSize: 10 }}>
                ({tyreAge}L)
              </span>
            )}
            {isPit && (
              <span style={{ color: "#f59e0b", fontSize: 10 }}>
                PIT
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LapTimeChart({
  laps,
  drivers,
  showMedian = false,
  filterPitLaps = true,
  className,
}: LapTimeChartProps) {
  const [hiddenDrivers, setHiddenDrivers] = useState<Set<string>>(new Set());

  const toggleDriver = useCallback((acronym: string) => {
    setHiddenDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(acronym)) next.delete(acronym);
      else next.add(acronym);
      return next;
    });
  }, []);

  const { chartData, medianTime } = useMemo(() => {
    const lapNumbers = [...new Set(laps.map((l) => l.lap_number))].sort(
      (a, b) => a - b
    );

    const allValidTimes: number[] = [];

    const data = lapNumbers.map((lapNum) => {
      const row: ChartRow = { lap: lapNum };
      for (const d of drivers) {
        const lap = laps.find(
          (l) => l.lap_number === lapNum && l.driver_number === d.number
        );
        if (!lap) {
          row[d.acronym] = null;
          continue;
        }

        // Store metadata for tooltip
        row[`${d.acronym}_compound`] = lap.compound;
        row[`${d.acronym}_tyreAge`] = lap.tyre_age;
        row[`${d.acronym}_pit`] = lap.is_pit_out_lap ? 1 : 0;

        if (filterPitLaps && lap.is_pit_out_lap) {
          // Store as pit marker data, null for main line
          row[`${d.acronym}_pitTime`] = lap.lap_duration;
          row[d.acronym] = null;
        } else {
          row[d.acronym] = lap.lap_duration;
          if (lap.lap_duration != null) {
            allValidTimes.push(lap.lap_duration);
          }
        }
      }
      return row;
    });

    const median =
      allValidTimes.length > 0
        ? allValidTimes.sort((a, b) => a - b)[
            Math.floor(allValidTimes.length / 2)
          ]
        : null;

    return { chartData: data, medianTime: median };
  }, [laps, drivers, filterPitLaps]);

  const visibleDrivers = drivers.filter((d) => !hiddenDrivers.has(d.acronym));

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {drivers.map((d) => {
          const hidden = hiddenDrivers.has(d.acronym);
          return (
            <button
              key={d.number}
              type="button"
              onClick={() => toggleDriver(d.acronym)}
              className="flex items-center gap-1.5 text-xs transition-opacity"
              style={{ opacity: hidden ? 0.3 : 1 }}
            >
              <span
                className="w-3 h-0.5 rounded-full inline-block"
                style={{ backgroundColor: teamColorVar(d.teamColour) }}
              />
              <span
                className="font-semibold"
                style={{ color: teamColorVar(d.teamColour) }}
              >
                {d.acronym}
              </span>
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={350} minHeight={250}>
        <ComposedChart data={chartData}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="lap"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            label={{
              value: "Lap",
              position: "insideBottomRight",
              offset: -5,
              style: { fill: "var(--muted-foreground)", fontSize: 11 },
            }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => formatLapTime(v)}
            domain={["auto", "auto"]}
            label={{
              value: "Time",
              angle: -90,
              position: "insideLeft",
              style: { fill: "var(--muted-foreground)", fontSize: 11 },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showMedian && medianTime != null && (
            <ReferenceLine
              y={medianTime}
              stroke="var(--muted-foreground)"
              strokeDasharray="5 5"
              strokeWidth={1}
              label={{
                value: `Median: ${formatLapTime(medianTime)}`,
                position: "insideTopRight",
                style: {
                  fill: "var(--muted-foreground)",
                  fontSize: 10,
                },
              }}
            />
          )}
          {visibleDrivers.map((d) => (
            <Line
              key={d.number}
              type="monotone"
              dataKey={d.acronym}
              stroke={teamColorVar(d.teamColour)}
              dot={false}
              strokeWidth={1.5}
              connectNulls={false}
              activeDot={{
                r: 4,
                stroke: teamColorVar(d.teamColour),
                strokeWidth: 2,
                fill: "var(--background)",
              }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
