"use client";

import { useState, useCallback } from "react";
import type { PitStrategy, TyreCompound } from "@/types/race";
import { teamColorVar } from "@/lib/utils";

const tyreColors: Record<string, string> = {
  SOFT: "#FF3333",
  MEDIUM: "#FFD700",
  HARD: "#F0F0F0",
  INTERMEDIATE: "#43B02A",
  WET: "#0072CE",
};

const COMPOUND_SHORT: Record<TyreCompound, string> = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
};

export interface TyreStrategyChartProps {
  strategies: PitStrategy[];
  totalLaps: number;
  className?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: {
    driver: string;
    compound: TyreCompound;
    lapStart: number;
    lapEnd: number;
    stintLaps: number;
    tyreAgeAtStart: number;
  } | null;
}

export function TyreStrategyChart({
  strategies,
  totalLaps,
  className,
}: TyreStrategyChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const showTooltip = useCallback(
    (
      e: React.MouseEvent,
      driver: string,
      compound: TyreCompound,
      lapStart: number,
      lapEnd: number,
      stintLaps: number,
      tyreAgeAtStart: number
    ) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltip({
        visible: true,
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 60,
        content: { driver, compound, lapStart, lapEnd, stintLaps, tyreAgeAtStart },
      });
    },
    []
  );

  const hideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <div className={`${className || ""} relative`}>
      <div className="space-y-1.5">
        {strategies.map((driver) => (
          <div key={driver.driver_number} className="flex items-center gap-2">
            {/* Driver label */}
            <div className="w-10 shrink-0 text-right">
              <span
                className="text-xs font-bold"
                style={{ color: teamColorVar(driver.team_colour) }}
              >
                {driver.name_acronym}
              </span>
            </div>

            {/* Stint bars with pit stop markers */}
            <div className="flex-1 relative h-7 rounded overflow-hidden bg-secondary">
              {driver.stints.map((stint, idx) => {
                const widthPct =
                  ((stint.lap_end - stint.lap_start + 1) / totalLaps) * 100;
                const leftPct = ((stint.lap_start - 1) / totalLaps) * 100;

                return (
                  <div
                    key={stint.stint_number}
                    className="absolute h-full flex items-center justify-center cursor-default transition-opacity hover:opacity-90"
                    style={{
                      width: `${widthPct}%`,
                      left: `${leftPct}%`,
                      backgroundColor: tyreColors[stint.compound] || "#666",
                      color:
                        stint.compound === "HARD" || stint.compound === "MEDIUM"
                          ? "#000"
                          : "#fff",
                    }}
                    onMouseEnter={(e) =>
                      showTooltip(
                        e,
                        driver.name_acronym,
                        stint.compound,
                        stint.lap_start,
                        stint.lap_end,
                        stint.stint_laps,
                        stint.tyre_age_at_start
                      )
                    }
                    onMouseLeave={hideTooltip}
                  >
                    <span className="text-[10px] font-bold leading-none select-none">
                      {stint.stint_laps > 3 && (
                        <>
                          {COMPOUND_SHORT[stint.compound]}{" "}
                          <span className="opacity-70">{stint.stint_laps}</span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}

              {/* Pit stop markers */}
              {driver.pit_stops.map((pit, idx) => {
                const leftPct = ((pit.lap_number - 1) / totalLaps) * 100;
                return (
                  <div
                    key={`pit-${idx}`}
                    className="absolute top-0 h-full pointer-events-none"
                    style={{
                      left: `${leftPct}%`,
                      width: 2,
                      backgroundColor: "var(--background)",
                      opacity: 0.8,
                    }}
                  />
                );
              })}
            </div>

            {/* Pit count */}
            <div className="w-6 shrink-0 text-center">
              <span className="text-[10px] text-muted-foreground">
                {driver.pit_stops.length}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lap scale */}
      <div className="flex items-center gap-2 mt-2">
        <div className="w-10" />
        <div className="flex-1 flex justify-between text-[10px] text-muted-foreground">
          <span>1</span>
          <span>{Math.round(totalLaps / 4)}</span>
          <span>{Math.round(totalLaps / 2)}</span>
          <span>{Math.round((totalLaps * 3) / 4)}</span>
          <span>{totalLaps}</span>
        </div>
        <div className="w-6" />
      </div>

      {/* Compound legend */}
      <div className="flex items-center gap-2 mt-3 ml-12">
        {(["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"] as const).map(
          (compound) => {
            // Only show compounds that are actually used
            const isUsed = strategies.some((s) =>
              s.stints.some((st) => st.compound === compound)
            );
            if (!isUsed) return null;
            return (
              <div key={compound} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ backgroundColor: tyreColors[compound] }}
                />
                <span className="text-[10px] text-muted-foreground capitalize">
                  {compound.toLowerCase()}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* Custom tooltip */}
      {tooltip.visible && tooltip.content && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "6px 10px",
            fontSize: "11px",
            whiteSpace: "nowrap",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{
                backgroundColor:
                  tyreColors[tooltip.content.compound] || "#666",
              }}
            />
            <span
              style={{ fontWeight: 700, color: "var(--foreground)" }}
            >
              {tooltip.content.compound}
            </span>
          </div>
          <div style={{ color: "var(--muted-foreground)" }}>
            Laps {tooltip.content.lapStart} - {tooltip.content.lapEnd} (
            {tooltip.content.stintLaps} laps)
          </div>
          {tooltip.content.tyreAgeAtStart > 0 && (
            <div style={{ color: "var(--muted-foreground)" }}>
              Tyre age at start: {tooltip.content.tyreAgeAtStart}L
            </div>
          )}
        </div>
      )}
    </div>
  );
}
