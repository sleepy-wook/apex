import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, PositionBadge } from "@/components/ui/Badge";
import { DriverTag } from "@/components/ui/DriverTag";
import { Button } from "@/components/ui/Button";
import {
  getRaces,
  getRaceSummary,
  getRaceResults,
  getDriverStandings,
  getConstructorStandings,
} from "@/lib/api";
import { Trophy, Flag, ChevronRight, BarChart3, Users } from "lucide-react";

export const revalidate = 3600;

const CURRENT_YEAR = 2024;

async function getHomeData() {
  try {
    const [racesRes, driverStandings, constructorStandings] = await Promise.all(
      [
        getRaces(CURRENT_YEAR),
        getDriverStandings(CURRENT_YEAR),
        getConstructorStandings(CURRENT_YEAR),
      ]
    );

    // Find latest completed race (one with a winner)
    const completedRaces = racesRes.races.filter((r) => r.winner_name);
    const latestRace = completedRaces[completedRaces.length - 1];

    let summary = null;
    let results = null;
    if (latestRace) {
      [summary, results] = await Promise.all([
        getRaceSummary(CURRENT_YEAR, latestRace.round).catch(() => null),
        getRaceResults(CURRENT_YEAR, latestRace.round).catch(() => null),
      ]);
    }

    return {
      latestRace,
      summary,
      results: results?.results?.slice(0, 5) ?? [],
      driverStandings: driverStandings.standings.slice(0, 5),
      constructorStandings: constructorStandings.standings.slice(0, 5),
      totalRaces: racesRes.races.length,
    };
  } catch {
    return {
      latestRace: null,
      summary: null,
      results: [],
      driverStandings: [],
      constructorStandings: [],
      totalRaces: 0,
    };
  }
}

export default async function HomePage() {
  const {
    latestRace,
    summary,
    results,
    driverStandings,
    constructorStandings,
  } = await getHomeData();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--color-border-primary)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(54,113,198,0.08),_transparent_60%)]" />
        <Container className="relative py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-1 rounded-full bg-[var(--color-info)]" />
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-text-tertiary)]">
                F1 Data Platform
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--color-text-primary)] mb-4">
              <span className="text-[var(--color-info)]">APEX</span>
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              한국 F1 팬을 위한 데이터 분석 플랫폼.
              <br className="hidden sm:block" />
              레이스 리뷰, 드라이버 비교, 타이어 전략을 한눈에.
            </p>
            <div className="flex flex-wrap gap-3">
              {latestRace && (
                <Link href={`/race/${CURRENT_YEAR}/${latestRace.round}`}>
                  <Button size="lg">
                    <Flag size={18} />
                    최신 레이스 리뷰
                  </Button>
                </Link>
              )}
              <Link href={`/standings/${CURRENT_YEAR}`}>
                <Button variant="secondary" size="lg">
                  <BarChart3 size={18} />
                  챔피언십 스탠딩
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Race Result */}
          <div className="lg:col-span-2">
            {latestRace && summary ? (
              <Card padding="none" className="overflow-hidden">
                {/* Race header bar */}
                <div
                  className="h-1"
                  style={{
                    backgroundColor: summary.winner.team_colour
                      ? `#${summary.winner.team_colour.replace("#", "")}`
                      : "var(--color-info)",
                  }}
                />
                <div className="p-4 sm:p-6">
                  <CardHeader>
                    <CardTitle>최신 레이스</CardTitle>
                    <Link
                      href={`/race/${CURRENT_YEAR}/${latestRace.round}`}
                      className="text-xs text-[var(--color-info)] hover:underline flex items-center gap-0.5"
                    >
                      상세 보기 <ChevronRight size={12} />
                    </Link>
                  </CardHeader>

                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)]">
                      {summary.race_name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-[var(--color-text-secondary)]">
                      <span>Round {summary.round}</span>
                      <span>{summary.circuit_short_name}</span>
                      <span>
                        {new Date(summary.date).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Winner highlight */}
                  <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-4 mb-4 flex items-center gap-4">
                    <Trophy
                      size={24}
                      className="text-[var(--color-p1)] shrink-0"
                    />
                    <div>
                      <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-0.5">
                        우승
                      </p>
                      <DriverTag
                        name={summary.winner.full_name}
                        acronym={summary.winner.name_acronym}
                        teamColour={summary.winner.team_colour}
                      />
                    </div>
                    <div className="ml-auto text-right">
                      <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
                        <span>랩 {summary.total_laps}</span>
                        {summary.safety_car_count > 0 && (
                          <Badge variant="warning" size="sm">
                            SC {summary.safety_car_count}
                          </Badge>
                        )}
                        {summary.red_flag_count > 0 && (
                          <Badge variant="error" size="sm">
                            Red Flag {summary.red_flag_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Top 5 results */}
                  {results.length > 0 && (
                    <div className="space-y-2">
                      {results.map((r) => (
                        <div
                          key={r.driver_number}
                          className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
                        >
                          <PositionBadge position={r.position} />
                          <DriverTag
                            name={r.full_name}
                            acronym={r.name_acronym}
                            teamColour={r.team_colour}
                            headshotUrl={r.headshot_url}
                            size="sm"
                          />
                          <span className="ml-auto text-sm font-mono text-[var(--color-text-secondary)]">
                            {r.points > 0 ? `+${r.points} pts` : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card padding="lg">
                <p className="text-[var(--color-text-secondary)]">
                  레이스 데이터를 불러오는 중입니다...
                </p>
              </Card>
            )}
          </div>

          {/* Right column: Standings */}
          <div className="space-y-6">
            {/* Driver Standings */}
            <Card padding="none">
              <div className="p-4">
                <CardHeader>
                  <CardTitle>드라이버 스탠딩</CardTitle>
                  <Link
                    href={`/standings/${CURRENT_YEAR}`}
                    className="text-xs text-[var(--color-info)] hover:underline flex items-center gap-0.5"
                  >
                    전체 보기 <ChevronRight size={12} />
                  </Link>
                </CardHeader>
                <div className="space-y-2">
                  {driverStandings.map((d) => (
                    <div
                      key={d.driver_id}
                      className="flex items-center gap-2.5 py-1.5"
                    >
                      <PositionBadge position={d.position} />
                      <DriverTag
                        name={d.driver_name}
                        acronym={d.name_acronym}
                        teamColour={d.team_colour}
                        size="sm"
                      />
                      <span className="ml-auto text-sm font-bold font-mono text-[var(--color-text-primary)]">
                        {d.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Constructor Standings */}
            <Card padding="none">
              <div className="p-4">
                <CardHeader>
                  <CardTitle>컨스트럭터 스탠딩</CardTitle>
                  <Link
                    href={`/standings/${CURRENT_YEAR}`}
                    className="text-xs text-[var(--color-info)] hover:underline flex items-center gap-0.5"
                  >
                    전체 보기 <ChevronRight size={12} />
                  </Link>
                </CardHeader>
                <div className="space-y-2">
                  {constructorStandings.map((c) => (
                    <div
                      key={c.constructor_id}
                      className="flex items-center gap-2.5 py-1.5"
                    >
                      <PositionBadge position={c.position} />
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-5 rounded-full shrink-0"
                          style={{
                            backgroundColor: `#${c.team_colour.replace("#", "")}`,
                          }}
                        />
                        <span className="text-sm text-[var(--color-text-primary)]">
                          {c.constructor_name}
                        </span>
                      </div>
                      <span className="ml-auto text-sm font-bold font-mono text-[var(--color-text-primary)]">
                        {c.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Link href={`/seasons/${CURRENT_YEAR}`}>
            <Card className="hover:bg-[var(--color-bg-hover)] transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-info)]/10 flex items-center justify-center">
                  <Flag
                    size={20}
                    className="text-[var(--color-info)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-info)] transition-colors">
                    {CURRENT_YEAR} 시즌 일정
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    전체 레이스 캘린더
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="ml-auto text-[var(--color-text-muted)] group-hover:text-[var(--color-info)] transition-colors"
                />
              </div>
            </Card>
          </Link>

          <Link href="/drivers">
            <Card className="hover:bg-[var(--color-bg-hover)] transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-success)]/10 flex items-center justify-center">
                  <Users
                    size={20}
                    className="text-[var(--color-success)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-success)] transition-colors">
                    드라이버
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    드라이버 프로필 & 통계
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="ml-auto text-[var(--color-text-muted)] group-hover:text-[var(--color-success)] transition-colors"
                />
              </div>
            </Card>
          </Link>

          <Link href={`/standings/${CURRENT_YEAR}`}>
            <Card className="hover:bg-[var(--color-bg-hover)] transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-warning)]/10 flex items-center justify-center">
                  <BarChart3
                    size={20}
                    className="text-[var(--color-warning)]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-warning)] transition-colors">
                    챔피언십
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    포인트 스탠딩 & 통계
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="ml-auto text-[var(--color-text-muted)] group-hover:text-[var(--color-warning)] transition-colors"
                />
              </div>
            </Card>
          </Link>
        </div>
      </Container>
    </div>
  );
}
