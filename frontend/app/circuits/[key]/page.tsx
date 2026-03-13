import Link from "next/link";
import { getCircuitDetail, getSeasons } from "@/lib/api";
import { notFound } from "next/navigation";
import {
  MapPin,
  Route,
  CornerDownRight,
  Gauge,
  Calendar,
  Trophy,
  Clock,
} from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";

export const revalidate = 86400;

interface CircuitDetailPageProps {
  params: Promise<{ key: string }>;
}

export async function generateMetadata({ params }: CircuitDetailPageProps) {
  const { key } = await params;
  // We can't fetch data here easily without caching, so use generic title
  return {
    title: `서킷 상세 | APEX`,
    description: `F1 서킷 상세 정보`,
  };
}

export default async function CircuitDetailPage({
  params,
}: CircuitDetailPageProps) {
  const { key } = await params;
  const circuitKey = Number(key);

  if (isNaN(circuitKey)) {
    notFound();
  }

  let circuit = null;
  let latestYear = new Date().getFullYear();
  try {
    const [circuitData, seasonsData] = await Promise.all([
      getCircuitDetail(circuitKey),
      getSeasons(),
    ]);
    circuit = circuitData;
    if (seasonsData.seasons.length > 0) {
      latestYear = seasonsData.seasons[0];
    }
  } catch {
    // API unavailable
  }

  if (!circuit) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">
            홈
          </Link>
          <span>/</span>
          <Link
            href="/circuits"
            className="hover:text-foreground transition-colors"
          >
            서킷
          </Link>
          <span>/</span>
          <span className="text-foreground">상세</span>
        </nav>
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            서킷 데이터를 불러올 수 없습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈
        </Link>
        <span>/</span>
        <Link
          href="/circuits"
          className="hover:text-foreground transition-colors"
        >
          서킷
        </Link>
        <span>/</span>
        <span className="text-foreground">{circuit.circuit_short_name}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {circuit.circuit_full_name || circuit.circuit_short_name}
          </h1>
        </div>
        <p className="text-muted-foreground ml-4 flex items-center gap-1">
          <MapPin size={14} />
          {circuit.city && `${circuit.city}, `}
          {circuit.country_name}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Route size={16} />}
          label="트랙 길이"
          value={
            circuit.track_length_km
              ? `${circuit.track_length_km} km`
              : "-"
          }
        />
        <StatCard
          icon={<CornerDownRight size={16} />}
          label="코너 수"
          value={circuit.turns ? `${circuit.turns}개` : "-"}
        />
        <StatCard
          icon={<Gauge size={16} />}
          label="DRS 구간"
          value={circuit.drs_zones ? `${circuit.drs_zones}구간` : "-"}
        />
        <StatCard
          icon={<Calendar size={16} />}
          label="첫 GP"
          value={
            circuit.first_gp_year ? `${circuit.first_gp_year}년` : "-"
          }
        />
      </div>

      {/* Lap Record */}
      {circuit.lap_record_time && (
        <div className="border border-border bg-card p-5 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 bg-primary" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              Lap Record
            </span>
          </div>
          <div className="flex items-baseline gap-3 ml-4">
            <span className="font-mono text-2xl font-bold text-primary">
              {circuit.lap_record_time}
            </span>
            <span className="text-sm text-muted-foreground">
              {circuit.lap_record_driver}
            </span>
            {circuit.lap_record_year && (
              <span className="text-xs text-muted-foreground">
                ({circuit.lap_record_year})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Past Races */}
      {circuit.past_races && circuit.past_races.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-5 bg-primary" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              Recent Results
            </span>
          </div>

          <div className="border border-border bg-card overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[4rem_1fr_10rem_6rem] gap-4 px-5 py-3 border-b border-border bg-muted/30">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Year
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Winner
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                Team
              </span>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground text-right">
                Laps
              </span>
            </div>

            {circuit.past_races.map((race, idx) => (
              <div
                key={race.year}
                className="flex md:grid md:grid-cols-[4rem_1fr_10rem_6rem] items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {race.year}
                </span>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Trophy size={12} className="text-amber-500 shrink-0" />
                  <span className="text-sm text-foreground truncate">
                    {race.winner_name || "-"}
                  </span>
                </div>
                <span className="hidden md:block text-sm text-muted-foreground truncate">
                  {race.winner_team || "-"}
                </span>
                <span className="text-sm text-muted-foreground text-right tabular-nums">
                  {race.total_laps || "-"}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <AdSlot />

      <RelatedPages
        links={[
          { href: "/circuits", label: "서킷 목록", description: "전체 F1 서킷 목록" },
          { href: `/schedule/${latestYear}`, label: "시즌 일정", description: "GP 일정 및 세션 시간표" },
          { href: `/standings/${latestYear}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
        ]}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-semibold tracking-wider uppercase">
          {label}
        </span>
      </div>
      <span className="font-display text-lg font-bold text-foreground">
        {value}
      </span>
    </div>
  );
}
