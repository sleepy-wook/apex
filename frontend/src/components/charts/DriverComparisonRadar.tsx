"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { teamColorVar } from "@/lib/utils";

export interface DriverComparisonStats {
  driver_id: string;
  name_acronym: string;
  full_name: string;
  team_colour: string;
  /** All values normalized 0-100 */
  qualifying: number;
  race_pace: number;
  consistency: number;
  overtakes: number;
  points: number;
}

export interface DriverComparisonRadarProps {
  driver1: DriverComparisonStats;
  driver2: DriverComparisonStats;
  className?: string;
}

const AXES = [
  { key: "qualifying", label: "Qualifying" },
  { key: "race_pace", label: "Race Pace" },
  { key: "consistency", label: "Consistency" },
  { key: "overtakes", label: "Overtakes" },
  { key: "points", label: "Points" },
] as const;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "6px 10px",
        fontSize: "12px",
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          fontWeight: 600,
          marginBottom: 2,
        }}
      >
        {payload[0]?.payload?.axis}
      </p>
      {payload.map((entry: any) => (
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
              backgroundColor: entry.fill || entry.stroke,
              display: "inline-block",
            }}
          />
          <span style={{ color: entry.fill || entry.stroke, fontWeight: 600 }}>
            {entry.name}
          </span>
          <span style={{ color: "var(--foreground)" }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DriverComparisonRadar({
  driver1,
  driver2,
  className,
}: DriverComparisonRadarProps) {
  const chartData = AXES.map(({ key, label }) => ({
    axis: label,
    [driver1.name_acronym]: driver1[key],
    [driver2.name_acronym]: driver2[key],
  }));

  const color1 = teamColorVar(driver1.team_colour);
  const color2 = teamColorVar(driver2.team_colour);

  return (
    <div className={className}>
      {/* Driver names header */}
      <div className="flex items-center justify-center gap-6 mb-3">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: color1 }}
          />
          <span className="text-sm font-bold" style={{ color: color1 }}>
            {driver1.name_acronym}
          </span>
          <span className="text-xs text-muted-foreground">
            {driver1.full_name}
          </span>
        </div>
        <span className="text-muted-foreground text-xs">vs</span>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: color2 }}
          />
          <span className="text-sm font-bold" style={{ color: color2 }}>
            {driver2.name_acronym}
          </span>
          <span className="text-xs text-muted-foreground">
            {driver2.full_name}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350} minHeight={280}>
        <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke="var(--border)"
            gridType="polygon"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{
              fill: "var(--muted-foreground)",
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            name={driver1.name_acronym}
            dataKey={driver1.name_acronym}
            stroke={color1}
            fill={color1}
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name={driver2.name_acronym}
            dataKey={driver2.name_acronym}
            stroke={color2}
            fill={color2}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
