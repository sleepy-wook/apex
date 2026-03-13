"use client"

import Link from "next/link"
import type { ConstructorStanding } from "@/types/standing"

interface ConstructorStandingsProps {
  standings: ConstructorStanding[]
  year: number
}

export function ConstructorStandings({ standings, year }: ConstructorStandingsProps) {
  if (standings.length === 0) return null

  const maxPoints = Math.max(...standings.map((c) => c.points))

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-primary" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Constructor Championship
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              컨스트럭터 순위
            </h2>
          </div>
          <Link
            href={`/standings/${year}`}
            className="hidden md:inline-flex text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            전체 순위 보기
          </Link>
        </div>

        {/* Bar Chart */}
        <div className="bg-background border border-border p-6 md:p-8">
          {/* Chart Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Team
            </span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Points
            </span>
          </div>

          <div className="space-y-5">
            {standings.map((constructor, index) => {
              const teamColor = `#${constructor.team_colour}`
              const barWidth = (constructor.points / maxPoints) * 100

              return (
                <div key={constructor.position} className="group">
                  <div className="flex items-center gap-3 md:gap-4 mb-2">
                    {/* Rank */}
                    <span className="w-5 text-[13px] font-semibold text-muted-foreground tabular-nums">
                      {String(constructor.position).padStart(2, "0")}
                    </span>

                    {/* Team Color Indicator */}
                    <div
                      className="w-1 h-6 flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />

                    {/* Team Name */}
                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                      <span className="font-semibold text-foreground text-[15px]">
                        {constructor.constructor_name}
                      </span>
                      {constructor.wins > 0 && (
                        <span className="text-[11px] text-primary font-semibold">
                          {constructor.wins}승
                        </span>
                      )}
                    </div>

                    {/* Points */}
                    <span className="font-display text-lg font-bold text-foreground tabular-nums">
                      {constructor.points}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="ml-[30px] md:ml-[38px]">
                    <div className="h-2 bg-muted/80 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: index === 0 ? "var(--primary)" : teamColor,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chart Footer */}
          <div className="mt-8 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {year} 시즌
            </span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-primary" />
                <span className="text-[11px] text-muted-foreground">리더</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Link */}
        <div className="mt-10 md:hidden">
          <Link
            href={`/standings/${year}`}
            className="inline-flex text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            전체 순위 보기
          </Link>
        </div>
      </div>
    </section>
  )
}
