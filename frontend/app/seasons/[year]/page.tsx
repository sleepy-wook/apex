import Link from "next/link";
import { getRaces } from "@/lib/api";
import { notFound } from "next/navigation";
import { MapPin, Calendar, ChevronRight, Trophy } from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import type { RaceListItem } from "@/types/race";

export const revalidate = 86400;

interface SeasonPageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: SeasonPageProps) {
  const { year } = await params;
  return {
    title: `${year} 시즌 일정 | APEX`,
    description: `${year} F1 시즌 전체 레이스 일정 및 결과`,
  };
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    notFound();
  }

  let races: RaceListItem[] = [];
  try {
    const res = await getRaces(yearNum);
    races = res.races;
  } catch {
    // API unavailable — show empty state
  }

  const completedRaces = races.filter((r) => r.winner_name);
  const upcomingRaces = races.filter((r) => !r.winner_name);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
        <span>/</span>
        <span className="text-foreground">{yearNum} 시즌</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {yearNum} 시즌
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">총 {races.length}개 레이스 | {completedRaces.length}개 완료</p>
      </div>

      {/* Completed races */}
      {completedRaces.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            완료된 레이스
          </h2>
          <div className="space-y-3">
            {completedRaces.map((race) => (
              <RaceCard key={race.session_key} race={race} year={yearNum} />
            ))}
          </div>
        </section>
      )}

      {/* Ad between sections */}
      {completedRaces.length > 0 && upcomingRaces.length > 0 && <AdSlot />}

      {/* Upcoming races */}
      {upcomingRaces.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            예정된 레이스
          </h2>
          <div className="space-y-3">
            {upcomingRaces.map((race) => (
              <RaceCard
                key={race.session_key}
                race={race}
                year={yearNum}
                upcoming
              />
            ))}
          </div>
        </section>
      )}

      {races.length === 0 && (
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            시즌 데이터를 불러올 수 없습니다.
          </p>
        </div>
      )}

      <RelatedPages
        links={[
          { href: `/standings/${yearNum}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
          { href: `/schedule/${yearNum}`, label: "시즌 일정", description: "GP 세션 시간표 포함" },
          { href: "/drivers", label: "드라이버", description: "현재 시즌 드라이버 목록" },
        ]}
      />
    </div>
  );
}

function RaceCard({
  race,
  year,
  upcoming = false,
}: {
  race: RaceListItem;
  year: number;
  upcoming?: boolean;
}) {
  const date = new Date(race.date_start);
  const dateStr = date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
  const dayStr = date.toLocaleDateString("ko-KR", { weekday: "short" });

  return (
    <Link
      href={upcoming ? "#" : `/race/${year}/${race.round}`}
      className={upcoming ? "pointer-events-none" : ""}
    >
      <div
        className={`border border-border bg-card overflow-hidden transition-colors ${
          upcoming
            ? "opacity-60"
            : "hover:bg-muted/50 cursor-pointer"
        }`}
      >
        <div className="flex items-stretch">
          {/* Left color bar */}
          <div
            className="w-1 shrink-0"
            style={{
              backgroundColor: race.winner_team_colour
                ? `#${race.winner_team_colour.replace("#", "")}`
                : undefined,
            }}
          />

          <div className="flex-1 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            {/* Round number */}
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <span className="text-sm font-bold font-mono text-muted-foreground">
                R{race.round}
              </span>
            </div>

            {/* Race info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {race.country_name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} />
                  {race.circuit_short_name}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={10} />
                  {dateStr} ({dayStr})
                </span>
              </div>
            </div>

            {/* Winner or status */}
            {race.winner_name ? (
              <div className="hidden sm:flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-sm text-muted-foreground">
                  {race.winner_name}
                </span>
              </div>
            ) : (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-muted text-muted-foreground">
                예정
              </span>
            )}

            {!upcoming && (
              <ChevronRight
                size={16}
                className="text-muted-foreground shrink-0"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
