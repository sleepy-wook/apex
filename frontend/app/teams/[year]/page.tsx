import Link from "next/link";
import Image from "next/image";
import { getTeams } from "@/lib/api";
import { notFound } from "next/navigation";
import { Trophy, Users, MapPin, Wrench, User } from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import type { Team } from "@/types/team";

export const revalidate = 21600;

interface TeamsPageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: TeamsPageProps) {
  const { year } = await params;
  return {
    title: `${year} F1 팀 | APEX`,
    description: `${year} F1 시즌 컨스트럭터 팀 목록 및 드라이버 정보`,
  };
}

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    notFound();
  }

  let teams: Team[] = [];
  let round = 0;
  try {
    const res = await getTeams(yearNum);
    teams = res.teams;
    round = res.round;
  } catch {
    // API unavailable — show empty state
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈
        </Link>
        <span>/</span>
        <span className="text-foreground">{yearNum} 팀</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {yearNum} F1 팀
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">
          {teams.length}개 팀{round > 0 && ` | Round ${round} 기준`}
        </p>
      </div>

      {/* Team Grid */}
      {teams.length > 0 ? (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team.constructor_id} team={team} year={yearNum} />
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            팀 데이터를 불러올 수 없습니다.
          </p>
        </div>
      )}

      <AdSlot />

      <RelatedPages
        links={[
          { href: `/standings/${yearNum}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
          { href: "/drivers", label: "드라이버", description: "현재 시즌 드라이버 목록" },
          { href: `/schedule/${yearNum}`, label: "시즌 일정", description: "GP 일정 및 세션 시간표" },
        ]}
      />
    </div>
  );
}

function TeamCard({ team, year }: { team: Team; year: number }) {
  const teamColor = `#${team.team_colour}`;
  const isLeader = team.position === 1;

  return (
    <div
      className={`border bg-card overflow-hidden transition-colors ${
        isLeader ? "border-primary/30 shadow-sm" : "border-border"
      }`}
    >
      {/* Team Color Bar */}
      <div
        className="h-1"
        style={{ backgroundColor: isLeader ? "var(--primary)" : teamColor }}
      />

      <div className="p-5 md:p-6">
        {/* Header: Position + Team Name + Points */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-baseline gap-3">
            <span
              className={`font-display text-2xl font-bold ${
                isLeader ? "text-primary" : "text-muted-foreground/30"
              }`}
            >
              {team.position}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground tracking-tight">
                {team.constructor_name}
              </h3>
              {team.wins > 0 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Trophy size={11} className="text-amber-500" />
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {team.wins}승
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <span
              className={`font-display text-2xl font-bold ${
                isLeader ? "text-primary" : "text-foreground"
              }`}
            >
              {team.points}
            </span>
            <span className="text-sm text-muted-foreground ml-1">pts</span>
          </div>
        </div>

        {/* Team Details (if seed data available) */}
        {(team.engine_supplier || team.team_principal || team.base_city) && (
          <div className={`pt-4 border-t mb-4 ${isLeader ? "border-primary/20" : "border-border"}`}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {team.full_name && (
                <div className="col-span-2 text-muted-foreground mb-1">
                  {team.full_name}
                </div>
              )}
              {team.base_city && team.base_country && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={10} />
                  {team.base_city}, {team.base_country}
                </div>
              )}
              {team.engine_supplier && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Wrench size={10} />
                  {team.engine_supplier}
                </div>
              )}
              {team.team_principal && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User size={10} />
                  {team.team_principal}
                </div>
              )}
              {team.founded_year && (
                <div className="text-muted-foreground">
                  창립 {team.founded_year}년
                </div>
              )}
              {team.world_championships != null && team.world_championships > 0 && (
                <div className="flex items-center gap-1 text-amber-500 font-semibold col-span-2">
                  <Trophy size={10} />
                  월드 챔피언십 {team.world_championships}회
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drivers */}
        <div
          className={`pt-4 border-t ${isLeader ? "border-primary/20" : "border-border"}`}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-muted-foreground" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
              Drivers
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {team.drivers.map((driver) => (
              <div
                key={driver.name_acronym}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50"
              >
                {/* Driver Photo */}
                <div className="w-10 h-10 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {driver.headshot_url ? (
                    <Image
                      src={driver.headshot_url}
                      alt={driver.driver_name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-xs font-bold"
                      style={{ color: teamColor }}
                    >
                      {driver.name_acronym}
                    </span>
                  )}
                </div>

                {/* Driver Info */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {driver.driver_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {driver.points} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
