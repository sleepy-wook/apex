"use client";

import { useMemo, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { teamColorVar } from "@/lib/utils";

export interface GapChartDriver {
  driver_number: number;
  name_acronym: string;
  team_colour: string;
  laps: { lap: number; gap: number }[];
}

export interface GapChartProps {
  drivers: GapChartDriver[];
  className?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const sorted = [...payload]
    .filter((e: any) => e.value != null)
    .sort((a: any, b: any) => (a.value ?? 0) - (b.value ?? 0));

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-primary)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        fontSize: "12px",
        maxHeight: 280,
        overflowY: "auto",
      }}
    >
      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        Lap {label}
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
              backgroundColor: entry.stroke || entry.fill,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: entry.stroke || entry.fill,
              fontWeight: 600,
              minWidth: 32,
            }}
          >
            {entry.dataKey}
          </span>
          <span
            style={{
              color: "var(--color-text-primary)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {entry.value === 0
              ? "LEADER"
              : `+${Number(entry.value).toFixed(3)}s`}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GapChart({ drivers, className }: GapChartProps) {
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
    const allLaps = new Set<number>();
    for (const d of drivers) {
      for (const l of d.laps) allLaps.add(l.lap);
    }
    const lapNumbers = [...allLaps].sort((a, b) => a - b);

    return lapNumbers.map((lap) => {
      const row: Record<string, number | null> = { lap };
      for (const d of drivers) {
        const lapData = d.laps.find((l) => l.lap === lap);
        row[d.name_acronym] = lapData?.gap ?? null;
      }
      return row;
    });
  }, [drivers]);

  const visibleDrivers = drivers.filter(
    (d) => !hiddenDrivers.has(d.name_acronym)
  );

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {drivers.map((d) => {
          const hidden = hiddenDrivers.has(d.name_acronym);
          return (
            <button
              key={d.driver_number}
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

      <ResponsiveContainer width="100%" height={300} minHeight={220}>
        <AreaChart data={chartData}>
          <defs>
            {visibleDrivers.map((d) => (
              <linearGradient
                key={d.driver_number}
                id={`gap-gradient-${d.driver_number}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={teamColorVar(d.team_colour)}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={teamColorVar(d.team_colour)}
                  stopOpacity={0.02}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-secondary)"
            vertical={false}
          />
          <XAxis
            dataKey="lap"
            stroke="var(--color-text-tertiary)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="var(--color-text-tertiary)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => `${v.toFixed(0)}s`}
          />
          <Tooltip content={<CustomTooltip />} />
          {visibleDrivers.map((d) => (
            <Area
              key={d.driver_number}
              type="monotone"
              dataKey={d.name_acronym}
              stroke={teamColorVar(d.team_colour)}
              fill={`url(#gap-gradient-${d.driver_number})`}
              strokeWidth={1.5}
              connectNulls={false}
              activeDot={{
                r: 4,
                stroke: teamColorVar(d.team_colour),
                strokeWidth: 2,
                fill: "var(--color-bg-primary)",
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
