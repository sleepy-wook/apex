import { getDriverStandings, getConstructorStandings } from "@/lib/api";
import { StandingsTabs } from "./_components/StandingsTabs";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 21600;

interface StandingsPageProps {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: StandingsPageProps) {
  const { year } = await params;
  return {
    title: `${year} 챔피언십 스탠딩 | APEX`,
    description: `${year} F1 드라이버 & 컨스트럭터 챔피언십 순위`,
  };
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    notFound();
  }

  let driverStandings: Awaited<ReturnType<typeof getDriverStandings>> | null = null;
  let constructorStandings: Awaited<ReturnType<typeof getConstructorStandings>> | null = null;

  try {
    [driverStandings, constructorStandings] = await Promise.all([
      getDriverStandings(yearNum),
      getConstructorStandings(yearNum),
    ]);
  } catch {
    // API unavailable — show empty state
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
        <span>/</span>
        <Link href={`/seasons/${yearNum}`} className="hover:text-foreground transition-colors">{yearNum} 시즌</Link>
        <span>/</span>
        <span className="text-foreground">스탠딩</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-5 bg-primary" />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {yearNum} 챔피언십
          </h1>
        </div>
        {driverStandings && (
          <p className="text-muted-foreground ml-4">Round {driverStandings.round} 기준</p>
        )}
      </div>

      {driverStandings && constructorStandings ? (
        <StandingsTabs
          driverStandings={driverStandings.standings}
          constructorStandings={constructorStandings.standings}
        />
      ) : (
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">스탠딩 데이터를 불러올 수 없습니다.</p>
        </div>
      )}

      <AdSlot />

      <RelatedPages
        links={[
          { href: `/schedule/${yearNum}`, label: `${yearNum} 일정`, description: "시즌 전체 GP 일정" },
          { href: `/teams/${yearNum}`, label: "팀", description: "컨스트럭터 팀 목록" },
          { href: "/drivers", label: "드라이버", description: "현재 시즌 드라이버" },
        ]}
      />
    </div>
  );
}
