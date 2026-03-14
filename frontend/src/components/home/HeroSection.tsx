import Link from "next/link"
import Image from "next/image"
import type { RaceSummary, DriverRaceResult } from "@/types/race"

interface HeroSectionProps {
  summary: RaceSummary | null
  podium: DriverRaceResult[]
  year: number
}

function formatRaceDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

export function HeroSection({ summary, podium, year }: HeroSectionProps) {
  if (!summary) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-5 bg-primary" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              최신 레이스 결과
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            레이스 데이터를 불러올 수 없습니다
          </h1>
        </div>
      </section>
    )
  }

  const winner = podium[0]
  const teamColor = winner ? `#${winner.team_colour}` : "var(--primary)"

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-5 bg-primary" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
            최신 레이스 결과
          </span>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-start">
          {/* Main Content */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-primary mb-3">
              라운드 {summary.round} &mdash; {formatRaceDate(summary.date)}
            </p>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
              {summary.race_name}
            </h1>

            <p className="mt-4 text-lg text-muted-foreground">
              {summary.circuit_short_name}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/race/${year}/${summary.round}`}
                className="inline-flex items-center justify-center bg-primary px-7 py-3 text-[13px] font-semibold tracking-wide text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                전체 결과 보기
              </Link>
              <Link
                href={`/seasons/${year}`}
                className="inline-flex items-center justify-center border border-border px-7 py-3 text-[13px] font-semibold tracking-wide text-foreground hover:bg-muted transition-colors"
              >
                시즌 일정
              </Link>
            </div>
          </div>

          {/* Winner Card */}
          {winner && (
            <div className="relative">
              <div className="border border-border bg-background">
                {/* Team Color Bar */}
                <div
                  className="h-1.5"
                  style={{ backgroundColor: teamColor }}
                />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                      우승
                    </p>
                    <span className="text-4xl font-display font-bold text-foreground">
                      P1
                    </span>
                  </div>

                  {/* Driver Photo */}
                  {winner.headshot_url && (
                    <div className="relative aspect-[4/3] bg-muted mb-6 overflow-hidden">
                      <Image
                        src={winner.headshot_url}
                        alt={winner.full_name}
                        fill
                        className="object-cover object-top"
                        unoptimized
                      />
                    </div>
                  )}

                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                      {winner.full_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className="w-2.5 h-2.5"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {winner.team_name}
                      </span>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border flex items-baseline gap-1">
                      <span className="text-3xl font-display font-bold text-foreground">
                        +{winner.points}
                      </span>
                      <span className="text-sm text-muted-foreground">포인트</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
