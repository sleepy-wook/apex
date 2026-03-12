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
  ReferenceArea,
} from "recharts";
import type { PositionData } from "@/types/race";
import { teamColorVar } from "@/lib/utils";

/** Race event overlay (Safety Car, VSC, Red Flag) */
export interface RaceEvent {
  type: "SC" | "VSC" | "RED_FLAG";
  lap_start: number;
  lap_end: number;
  label?: string;
}

const EVENT_COLORS: Record<RaceEvent["type"], string> = {
  SC: "rgba(234, 179, 8, 0.12)",      // yellow tint
  VSC: "rgba(234, 179, 8, 0.08)",     // lighter yellow tint
  RED_FLAG: "rgba(239, 68, 68, 0.15)", // red tint
};

const EVENT_BORDER: Record<RaceEvent["type"], string> = {
  SC: "rgba(234, 179, 8, 0.4)",
  VSC: "rgba(234, 179, 8, 0.25)",
  RED_FLAG: "rgba(239, 68, 68, 0.5)",
};

const EVENT_LABELS: Record<RaceEvent["type"], string> = {
  SC: "SC",
  VSC: "VSC",
  RED_FLAG: "RED",
};

export interface PositionChartProps {
  positions: PositionData[];
  totalLaps: number;
  /** Race events (Safety Car, Red Flag) to overlay */
  events?: RaceEvent[];
  className?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  // Sort entries by position (ascending)
  const sorted = [...payload]
    .filter((e: any) => e.value != null)
    .sort((a: any, b: any) => a.value - b.value);

  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-primary)",
        borderRadius: "var(--radius-md)",
        padding: "8px 12px",
        fontSize: "12px",
        maxHeight: 320,
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
              color: "var(--color-text-muted)",
              fontVariantNumeric: "tabular-nums",
              minWidth: 22,
              textAlign: "right",
            }}
          >
            P{entry.value}
          </span>
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
          <span style={{ color: entry.stroke, fontWeight: 600 }}>
            {entry.dataKey}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PositionChart({
  positions,
  totalLaps,
  events = [],
  className,
}: PositionChartProps) {
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
    const laps = Array.from({ length: totalLaps }, (_, i) => i + 1);
    return laps.map((lap) => {
      const row: Record<string, number> = { lap };
      for (const driver of positions) {
        const lapData = driver.laps.find((l) => l.lap === lap);
        if (lapData) row[driver.name_acronym] = lapData.position;
      }
      return row;
    });
  }, [positions, totalLaps]);

  const driverCount = positions.length;
  const visibleDrivers = positions.filter(
    (d) => !hiddenDrivers.has(d.name_acronym)
  );

  // Get final position for right-side labels
  const lastLapData = chartData[chartData.length - 1] || {};

  return (
    <div className={className}>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3">
        {positions.map((d) => {
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

      {/* Event legend (if any) */}
      {events.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
          {(["SC", "VSC", "RED_FLAG"] as const)
            .filter((type) => events.some((e) => e.type === type))
            .map((type) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px]">
                <span
                  className="w-3 h-3 rounded-sm inline-block"
                  style={{
                    backgroundColor: EVENT_COLORS[type],
                    border: `1px solid ${EVENT_BORDER[type]}`,
                  }}
                />
                <span style={{ color: "var(--color-text-muted)" }}>
                  {type === "SC"
                    ? "Safety Car"
                    : type === "VSC"
                    ? "Virtual Safety Car"
                    : "Red Flag"}
                </span>
              </div>
            ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={400} minHeight={300}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 50, left: 5, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border-secondary)"
            vertical={false}
          />

          {/* Race event overlays */}
          {events.map((evt, i) => (
            <ReferenceArea
              key={`${evt.type}-${i}`}
              x1={evt.lap_start}
              x2={evt.lap_end}
              fill={EVENT_COLORS[evt.type]}
              stroke={EVENT_BORDER[evt.type]}
              strokeWidth={1}
              label={{
                value: EVENT_LABELS[evt.type],
                position: "insideTopLeft",
                style: {
                  fill:
                    evt.type === "RED_FLAG"
                      ? "rgba(239, 68, 68, 0.7)"
                      : "rgba(234, 179, 8, 0.7)",
                  fontSize: 10,
                  fontWeight: 700,
                },
              }}
            />
          ))}

          <XAxis
            dataKey="lap"
            stroke="var(--color-text-tertiary)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            reversed
            domain={[1, Math.max(driverCount, 20)]}
            stroke="var(--color-text-tertiary)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => `P${v}`}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {visibleDrivers.map((driver) => (
            <Line
              key={driver.driver_number}
              type="stepAfter"
              dataKey={driver.name_acronym}
              stroke={teamColorVar(driver.team_colour)}
              dot={false}
              strokeWidth={2}
              activeDot={{
                r: 4,
                stroke: teamColorVar(driver.team_colour),
                strokeWidth: 2,
                fill: "var(--color-bg-primary)",
              }}
              label={
                // Show driver acronym at the last data point
                undefined
              }
            />
          ))}

        </LineChart>
      </ResponsiveContainer>

      {/* Driver end labels (outside chart for simplicity) */}
      <div className="flex justify-end -mt-2 mr-1">
        <div className="flex flex-col gap-0" style={{ fontSize: 9 }}>
          {visibleDrivers
            .map((d) => ({
              ...d,
              finalPos: lastLapData[d.name_acronym] ?? 99,
            }))
            .sort((a, b) => a.finalPos - b.finalPos)
            .slice(0, 10)
            .map((d) => (
              <span
                key={d.driver_number}
                style={{
                  color: teamColorVar(d.team_colour),
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {d.name_acronym}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
