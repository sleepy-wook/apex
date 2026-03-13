import { getDrivers } from "@/lib/api";
import type { Driver } from "@/types/driver";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 86400;

interface DriversYearPageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: DriversYearPageProps) {
  const { year } = await params;
  return {
    title: `${year} 드라이버 | APEX`,
    description: `${year} F1 드라이버 프로필 및 통계`,
  };
}

export default async function DriversYearPage({ params }: DriversYearPageProps) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    notFound();
  }

  let drivers: Driver[] = [];
  try {
    const res = await getDrivers(yearNum);
    drivers = res.drivers;
  } catch {
    // Fallback to empty
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
        <span>/</span>
        <span className="text-foreground">{yearNum} 드라이버</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {yearNum} 드라이버
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">
          {drivers.length > 0 ? `${drivers.length}명의 드라이버` : "드라이버 목록"}
        </p>
      </div>

      {drivers.length === 0 ? (
        <div className="border border-border bg-card p-6">
          <p className="text-muted-foreground">
            드라이버 데이터를 불러올 수 없습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map((driver) => (
            <DriverCard key={driver.driver_number} driver={driver} />
          ))}
        </div>
      )}

      <AdSlot />

      <RelatedPages
        links={[
          { href: `/teams/${yearNum}`, label: "팀", description: "컨스트럭터 팀 목록" },
          { href: `/standings/${yearNum}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
          { href: `/schedule/${yearNum}`, label: "시즌 일정", description: "GP 일정 및 세션 시간표" },
        ]}
      />
    </div>
  );
}

function DriverCard({ driver }: { driver: Driver }) {
  const teamColor = `#${driver.team_colour.replace("#", "")}`;

  return (
    <div className="border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors group">
      <div className="h-1" style={{ backgroundColor: teamColor }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Headshot */}
          <div className="w-14 h-14 rounded-full bg-muted overflow-hidden shrink-0 flex items-center justify-center">
            {driver.headshot_url ? (
              <img
                src={driver.headshot_url}
                alt={driver.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-lg font-bold"
                style={{ color: teamColor }}
              >
                {driver.name_acronym}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="text-2xl font-bold font-mono leading-none"
                style={{ color: teamColor }}
              >
                {driver.driver_number}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">
              {driver.first_name}{" "}
              <span className="uppercase">{driver.last_name}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-0.5 h-3 rounded-full"
                style={{ backgroundColor: teamColor }}
              />
              <p className="text-xs text-muted-foreground truncate">
                {driver.team_name}
              </p>
            </div>
            {driver.country_code && (
              <p className="text-xs text-muted-foreground mt-1">
                {driver.country_code}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
