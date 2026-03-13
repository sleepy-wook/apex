"use client"

import Link from "next/link"
import Image from "next/image"
import type { DriverRaceResult, RaceSummary } from "@/types/race"

interface RaceResultsProps {
  results: DriverRaceResult[]
  summary: RaceSummary | null
  year: number
}

export function RaceResults({ results, summary, year }: RaceResultsProps) {
  if (results.length === 0) return null

  const raceLink = summary ? `/race/${year}/${summary.round}` : `/seasons/${year}`

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-primary" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Race Results
              </span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              레이스 결과
            </h2>
          </div>
          <Link
            href={raceLink}
            className="hidden md:inline-flex text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            전체 결과 보기
          </Link>
        </div>

        {/* Results List */}
        <div className="border-t border-border">
          {results.slice(0, 10).map((result) => {
            const teamColor = `#${result.team_colour}`
            const isTopThree = result.position <= 3

            return (
              <div
                key={result.position}
                className="flex items-center gap-4 md:gap-8 py-5 border-b border-border group hover:bg-muted/30 transition-colors -mx-4 px-4"
              >
                {/* Position */}
                <div className="w-8 flex-shrink-0">
                  <span className={`font-display text-2xl font-bold ${
                    isTopThree ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {result.position}
                  </span>
                </div>

                {/* Driver Photo */}
                <div className="relative w-12 h-12 md:w-14 md:h-14 flex-shrink-0 overflow-hidden bg-muted">
                  {result.headshot_url ? (
                    <Image
                      src={result.headshot_url}
                      alt={result.full_name}
                      fill
                      className="object-cover object-top"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                      {result.name_acronym}
                    </div>
                  )}
                  {/* Team color indicator */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1"
                    style={{ backgroundColor: teamColor }}
                  />
                </div>

                {/* Driver Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${
                    isTopThree ? "text-foreground" : "text-foreground/80"
                  }`}>
                    {result.full_name}
                  </p>
                  <p className="text-[13px] text-muted-foreground truncate mt-0.5">
                    {result.team_name}
                  </p>
                </div>

                {/* Position Change */}
                <div className="hidden md:flex items-center justify-center w-16 flex-shrink-0">
                  {result.positions_gained === 0 ? (
                    <span className="text-sm text-muted-foreground">&mdash;</span>
                  ) : result.positions_gained > 0 ? (
                    <span className="text-sm font-semibold text-emerald-600">
                      +{result.positions_gained}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-primary">
                      {result.positions_gained}
                    </span>
                  )}
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0 w-16">
                  <span className={`font-display text-xl font-bold ${
                    isTopThree ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {result.points}
                  </span>
                  <span className="text-[11px] text-muted-foreground ml-1">
                    pts
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Link */}
        <div className="mt-8 md:hidden">
          <Link
            href={raceLink}
            className="inline-flex text-[13px] font-semibold text-primary hover:text-primary/80 transition-colors tracking-wide"
          >
            전체 결과 보기
          </Link>
        </div>
      </div>
    </section>
  )
}
