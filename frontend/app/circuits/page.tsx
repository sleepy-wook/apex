import Link from "next/link";
import { getCircuits, getSeasons } from "@/lib/api";
import { MapPin, Route, CornerDownRight, Gauge } from "lucide-react";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import type { Circuit } from "@/types/circuit";

export const revalidate = 86400;

export const metadata = {
  title: "F1 서킷 | APEX",
  description: "F1 서킷 목록 — 트랙 정보, 랩 레코드, 위치",
};

export default async function CircuitsPage() {
  let circuits: Circuit[] = [];
  let latestYear = new Date().getFullYear();
  try {
    const [res, seasonsData] = await Promise.all([
      getCircuits(),
      getSeasons(),
    ]);
    circuits = res.circuits;
    if (seasonsData.seasons.length > 0) {
      latestYear = seasonsData.seasons[0];
    }
  } catch {
    // API unavailable — show empty state
  }

  // Group circuits by country
  const byCountry = new Map<string, Circuit[]>();
  for (const circuit of circuits) {
    const country = circuit.country_name || "기타";
    if (!byCountry.has(country)) {
      byCountry.set(country, []);
    }
    byCountry.get(country)!.push(circuit);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">
          홈
        </Link>
        <span>/</span>
        <span className="text-foreground">서킷</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            F1 서킷
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">
          {circuits.length}개 서킷
        </p>
      </div>

      {/* Circuit Grid */}
      {circuits.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {circuits.map((circuit) => (
            <CircuitCard key={circuit.circuit_key} circuit={circuit} />
          ))}
        </div>
      ) : (
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            서킷 데이터를 불러올 수 없습니다.
          </p>
        </div>
      )}

      <AdSlot />

      <RelatedPages
        links={[
          { href: `/schedule/${latestYear}`, label: "시즌 일정", description: "GP 일정 및 세션 시간표" },
          { href: `/teams/${latestYear}`, label: "팀", description: "컨스트럭터 팀 목록" },
          { href: `/standings/${latestYear}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
        ]}
      />
    </div>
  );
}

function CircuitCard({ circuit }: { circuit: Circuit }) {
  return (
    <Link href={`/circuits/${circuit.circuit_key}`}>
      <div className="border border-border bg-card overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer h-full">
        {/* Top accent */}
        <div className="h-1 bg-primary" />

        <div className="p-4 sm:p-5">
          {/* Name */}
          <h3 className="font-display text-base font-bold text-foreground tracking-tight mb-1">
            {circuit.circuit_full_name || circuit.circuit_short_name}
          </h3>

          {/* Location */}
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
            <MapPin size={11} />
            {circuit.city && `${circuit.city}, `}
            {circuit.country_name}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            {circuit.track_length_km && (
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Route size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    길이
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {circuit.track_length_km} km
                </span>
              </div>
            )}
            {circuit.turns && (
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <CornerDownRight
                    size={10}
                    className="text-muted-foreground"
                  />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    코너
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {circuit.turns}개
                </span>
              </div>
            )}
            {circuit.drs_zones && (
              <div>
                <div className="flex items-center gap-1 mb-0.5">
                  <Gauge size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    DRS
                  </span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {circuit.drs_zones}구간
                </span>
              </div>
            )}
          </div>

          {/* Lap Record */}
          {circuit.lap_record_time && (
            <div className="mt-4 pt-3 border-t border-border">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Lap Record
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-sm font-bold text-primary">
                  {circuit.lap_record_time}
                </span>
                <span className="text-xs text-muted-foreground">
                  {circuit.lap_record_driver} ({circuit.lap_record_year})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
