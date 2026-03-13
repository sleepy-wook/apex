"use client";

import { useMemo, useState, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { StandingsProgression } from "@/types/standing";
import { teamColorVar } from "@/lib/utils";

export interface PointsProgressionChartProps {
  data: StandingsProgression[];
  /** Optional round labels (circuit names) */
  roundLabels?: Record<number, string>;
  className?: string;
}

function CustomTooltip({ active, payload, label, roundLabels }: any) {
  if (!active || !payload?.length) return null;

  const sorted = [...payload]
    .filter((e: any) => e.value != null)
    .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0));

  const roundLabel = roundLabels?.[label];

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
        fontSize: "12px",
        maxHeight: 360,
        overflowY: "auto",
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Round {label}
        {roundLabel && (
          <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>
            {" "}
            - {roundLabel}
          </span>
        )}
      </p>
      {sorted.map((entry: any) => (
        <div
          key={entry.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 1,
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
          <span
            style={{ color: entry.stroke, fontWeight: 600, minWidth: 32 }}
          >
            {entry.dataKey}
          </span>
          <span
            style={{
              color: "var(--foreground)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {entry.value} pts
          </span>
        </div>
      ))}
    </div>
  );
}

export function PointsProgressionChart({
  data,
  roundLabels,
  className,
}: PointsProgressionChartProps) {
  const [hiddenDrivers, setHiddenDrivers] = useState<Set<string>>(new Set());

  const toggleDriver = useCallback((acronym: string) => {
    setHiddenDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(acronym)) next.delete(acronym);
      else next.add(acronym);
      return next;
    });
  }, []);

  const chartData = useMemo(() => {
    // Collect all rounds
    const allRounds = new Set<number>();
    for (const d of data) {
      for (const r of d.rounds) allRounds.add(r.round);
    }
    const rounds = [...allRounds].sort((a, b) => a - b);

    return rounds.map((round) => {
      const row: Record<string, number | null> = { round };
      for (const d of data) {
        const roundData = d.rounds.find((r) => r.round === round);
        row[d.name_acronym] = roundData?.points ?? null;
      }
      return row;
    });
  }, [data]);

  const visibleDrivers = data.filter(
    (d) => !hiddenDrivers.has(d.name_acronym)
  );

  // Sort legend by final points (descending)
  const sortedDrivers = useMemo(() => {
    return [...data].sort((a, b) => {
      const aMax = a.rounds[a.rounds.length - 1]?.points ?? 0;
      const bMax = b.rounds[b.rounds.length - 1]?.points ?? 0;
      return bMax - aMax;
    });
  }, [data]);

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {sortedDrivers.map((d) => {
          const hidden = hiddenDrivers.has(d.name_acronym);
          return (
            <button
              key={d.driver_id}
              type="button"
              onClick={() => toggleDriver(d.name_acronym)}
              className="flex items-center gap-1.5 text-xs transition-opacity"
              style={{ opacity: hidden ? 0.3 : 1 }}
            >
              <span
                className="w-3 h-0.5 rounded-full inline-block"
                style={{ backgroundColor: teamColorVar(d.team_colour) }}
              />
              <span
                className="font-semibold"
                style={{ color: teamColorVar(d.team_colour) }}
              >
                {d.name_acronym}
              </span>
            </button>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={400} minHeight={280}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="round"
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => {
              if (roundLabels?.[v]) {
                // Show abbreviated circuit name on larger screens
                const label = roundLabels[v];
                return label.length > 5 ? label.slice(0, 3).toUpperCase() : label;
              }
              return `R${v}`;
            }}
            label={{
              value: "Round",
              position: "insideBottomRight",
              offset: -5,
              style: { fill: "var(--muted-foreground)", fontSize: 11 },
            }}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            tick={{ fontSize: 12 }}
            label={{
              value: "Points",
              angle: -90,
              position: "insideLeft",
              style: { fill: "var(--muted-foreground)", fontSize: 11 },
            }}
          />
          <Tooltip
            content={<CustomTooltip roundLabels={roundLabels} />}
          />
          {visibleDrivers.map((d) => (
            <Line
              key={d.driver_id}
              type="monotone"
              dataKey={d.name_acronym}
              stroke={teamColorVar(d.team_colour)}
              dot={{
                r: 2.5,
                fill: teamColorVar(d.team_colour),
                stroke: teamColorVar(d.team_colour),
              }}
              strokeWidth={2}
              connectNulls={false}
              activeDot={{
                r: 5,
                stroke: teamColorVar(d.team_colour),
                strokeWidth: 2,
                fill: "var(--background)",
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
