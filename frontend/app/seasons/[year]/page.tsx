import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getRaces } from "@/lib/api";
import { notFound } from "next/navigation";
import { MapPin, Calendar, ChevronRight, Trophy } from "lucide-react";
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
    notFound();
  }

  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: `${yearNum} 시즌` },
  ];

  const completedRaces = races.filter((r) => r.winner_name);
  const upcomingRaces = races.filter((r) => !r.winner_name);

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        title={`${yearNum} 시즌`}
        subtitle={`총 ${races.length}개 레이스 | ${completedRaces.length}개 완료`}
        breadcrumbs={breadcrumbs}
      />

      {/* Completed races */}
      {completedRaces.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
            완료된 레이스
          </h2>
          <div className="space-y-3">
            {completedRaces.map((race) => (
              <RaceCard key={race.session_key} race={race} year={yearNum} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming races */}
      {upcomingRaces.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-4">
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
        <Card padding="lg">
          <p className="text-[var(--color-text-secondary)]">
            시즌 데이터를 불러올 수 없습니다.
          </p>
        </Card>
      )}
    </Container>
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
      <Card
        padding="none"
        className={`overflow-hidden transition-colors ${
          upcoming
            ? "opacity-60"
            : "hover:bg-[var(--color-bg-hover)] cursor-pointer"
        }`}
      >
        <div className="flex items-stretch">
          {/* Left color bar */}
          <div
            className="w-1 shrink-0"
            style={{
              backgroundColor: race.winner_team_colour
                ? `#${race.winner_team_colour.replace("#", "")}`
                : "var(--color-border-primary)",
            }}
          />

          <div className="flex-1 p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
            {/* Round number */}
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold font-mono text-[var(--color-text-secondary)]">
                R{race.round}
              </span>
            </div>

            {/* Race info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {race.country_name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <MapPin size={10} />
                  {race.circuit_short_name}
                </span>
                <span className="text-xs text-[var(--color-text-tertiary)] flex items-center gap-1">
                  <Calendar size={10} />
                  {dateStr} ({dayStr})
                </span>
              </div>
            </div>

            {/* Winner or status */}
            {race.winner_name ? (
              <div className="hidden sm:flex items-center gap-2">
                <Trophy size={14} className="text-[var(--color-p1)]" />
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {race.winner_name}
                </span>
              </div>
            ) : (
              <Badge variant="default" size="sm">
                예정
              </Badge>
            )}

            {!upcoming && (
              <ChevronRight
                size={16}
                className="text-[var(--color-text-muted)] shrink-0"
              />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
