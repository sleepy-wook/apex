"use client"

import Link from "next/link"
import type { DriverStanding } from "@/types/standing"

interface DriverStandingsProps {
  standings: DriverStanding[]
  year: number
}

export function DriverStandings({ standings, year }: DriverStandingsProps) {
  if (standings.length === 0) return null

  const maxPoints = Math.max(...standings.map((d) => d.points))

  return (
    <section className="py-16 md:py-20 bg-muted/50 border-y border-border">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-primary" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Driver Championship
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              드라이버 순위
            </h2>
          </div>
          <Link
            href={`/standings/${year}`}
            className="hidden md:inline-flex text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            전체 순위 보기
          </Link>
        </div>

        {/* Top 3 Feature */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {standings.slice(0, 3).map((driver, index) => {
            const teamColor = `#${driver.team_colour}`
            const isLeader = index === 0

            return (
              <div
                key={driver.position}
                className={`bg-background border group transition-all ${
                  isLeader
                    ? "border-primary/30 shadow-sm"
                    : "border-border hover:border-border/60"
                }`}
              >
                {/* Team Color Bar */}
                <div
                  className="h-1"
                  style={{ backgroundColor: isLeader ? "var(--primary)" : teamColor }}
                />

                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className={`font-display text-3xl font-bold ${
                        isLeader ? "text-primary" : "text-muted-foreground/30"
                      }`}>
                        {driver.position}
                      </span>
                      {isLeader && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-primary">
                          Leader
                        </span>
                      )}
                    </div>
                    {driver.wins > 0 && (
                      <span className={`text-[11px] font-semibold tracking-wider ${
                        isLeader ? "text-primary" : "text-muted-foreground"
                      }`}>
                        {driver.wins} 승
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                    {driver.driver_name}
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-1 flex items-center gap-2">
                    <span
                      className="w-2 h-2 flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    {driver.team_name}
                  </p>

                  <div className={`mt-4 pt-4 border-t flex items-baseline gap-1 ${
                    isLeader ? "border-primary/20" : "border-border"
                  }`}>
                    <span className={`text-2xl font-display font-bold ${
                      isLeader ? "text-primary" : "text-foreground"
                    }`}>
                      {driver.points}
                    </span>
                    <span className="text-sm text-muted-foreground">pts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Rest of Standings */}
        <div className="bg-background border border-border">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[3rem_1fr_12rem_5rem] gap-4 px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Pos</span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Driver</span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">Progress</span>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-right">Pts</span>
          </div>

          {standings.slice(3, 10).map((driver) => {
            const teamColor = `#${driver.team_colour}`
            const progressWidth = (driver.points / maxPoints) * 100

            return (
              <div
                key={driver.position}
                className="flex md:grid md:grid-cols-[3rem_1fr_12rem_5rem] items-center gap-3 md:gap-4 px-4 md:px-5 py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {/* Rank */}
                <span className="w-8 md:w-auto text-[14px] font-semibold text-muted-foreground tabular-nums flex-shrink-0">
                  {String(driver.position).padStart(2, "0")}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-[15px] truncate">
                    {driver.driver_name}
                  </p>
                  <p className="text-[12px] text-muted-foreground truncate flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    {driver.team_name}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="hidden md:block">
                  <div className="h-1.5 bg-muted overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${progressWidth}%`,
                        backgroundColor: "var(--primary)",
                        opacity: 0.6 + (progressWidth / 100) * 0.4,
                      }}
                    />
                  </div>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <span className="font-display text-lg font-bold text-foreground tabular-nums">
                    {driver.points}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Link */}
        <div className="mt-8 md:hidden">
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
