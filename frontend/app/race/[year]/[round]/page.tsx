import {
  getRaceSummary,
  getRaceResults,
  getStrategy,
} from "@/lib/api";
import { RaceSummaryCard } from "./_components/RaceSummaryCard";
import { RaceResultTable } from "./_components/RaceResultTable";
import { StrategySection } from "./_components/StrategySection";
import { LapTimeChartSection } from "./_components/LapTimeSection";
import { PositionChartSection } from "./_components/PositionChartSection";
import { AdSlot } from "@/components/common/AdSlot";
import { RelatedPages } from "@/components/common/RelatedPages";
import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 86400;

interface RacePageProps {
  params: Promise<{ year: string; round: string }>;
}

export async function generateMetadata({ params }: RacePageProps) {
  const { year, round } = await params;
  try {
    const summary = await getRaceSummary(Number(year), Number(round));
    return {
      title: `${summary.race_name} | APEX`,
      description: `${summary.year} ${summary.race_name} 레이스 결과 및 분석`,
    };
  } catch {
    return {
      title: `${year} Round ${round} | APEX`,
    };
  }
}

export default async function RacePage({ params }: RacePageProps) {
  const { year, round } = await params;
  const yearNum = Number(year);
  const roundNum = Number(round);

  if (isNaN(yearNum) || isNaN(roundNum)) {
    notFound();
  }

  let summary: Awaited<ReturnType<typeof getRaceSummary>> | null = null;
  let resultsRes = { results: [] as Awaited<ReturnType<typeof getRaceResults>>["results"] };
  let strategyRes = { strategies: [] as Awaited<ReturnType<typeof getStrategy>>["strategies"] };

  try {
    summary = await getRaceSummary(yearNum, roundNum);
    [resultsRes, strategyRes] = await Promise.all([
      getRaceResults(yearNum, roundNum).catch(() => ({ results: [] as typeof resultsRes.results })),
      getStrategy(yearNum, roundNum).catch(() => ({ strategies: [] as typeof strategyRes.strategies })),
    ]);
  } catch {
    // API unavailable
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/" className="hover:text-foreground transition-colors">홈</Link>
        <span>/</span>
        <Link href={`/seasons/${yearNum}`} className="hover:text-foreground transition-colors">{yearNum} 시즌</Link>
        <span>/</span>
        <span className="text-foreground">Round {roundNum}</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-1 h-5"
            style={{ backgroundColor: summary ? `#${summary.winner.team_colour.replace("#", "")}` : "var(--primary)" }}
          />
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            {summary ? summary.race_name : `${yearNum} Round ${roundNum}`}
          </h1>
        </div>
        <p className="text-muted-foreground ml-4">{yearNum} Round {roundNum}</p>
      </div>

      {!summary ? (
        <div className="border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">레이스 데이터를 불러올 수 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Race Summary */}
          <section className="mb-8">
            <RaceSummaryCard summary={summary} />
          </section>

          <AdSlot />

          {/* Race Results */}
          <section className="mb-8">
            <div className="border border-border bg-card">
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">레이스 결과</h2>
                </div>
                <RaceResultTable results={resultsRes.results} />
              </div>
            </div>
          </section>

          {/* Lap Time Chart */}
          <section className="mb-8">
            <div className="border border-border bg-card">
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">랩 타임</h2>
                </div>
                <LapTimeChartSection year={yearNum} round={roundNum} />
              </div>
            </div>
          </section>

          {/* Position Chart */}
          <section className="mb-8">
            <div className="border border-border bg-card">
              <div className="p-4 sm:p-6">
                <div className="mb-4">
                  <h2 className="font-display text-lg font-bold text-foreground">포지션 변화</h2>
                </div>
                <PositionChartSection
                  year={yearNum}
                  round={roundNum}
                  totalLaps={summary.total_laps}
                />
              </div>
            </div>
          </section>

          <AdSlot />

          {/* Tyre Strategy */}
          {strategyRes.strategies.length > 0 && (
            <section className="mb-8">
              <StrategySection
                strategies={strategyRes.strategies}
                totalLaps={summary.total_laps}
              />
            </section>
          )}
          <RelatedPages
            links={[
              { href: `/seasons/${yearNum}`, label: `${yearNum} 시즌`, description: "시즌 전체 레이스 목록" },
              { href: `/standings/${yearNum}`, label: "챔피언십 순위", description: "드라이버 & 컨스트럭터 순위" },
              { href: "/drivers", label: "드라이버", description: "현재 시즌 드라이버 목록" },
            ]}
          />
        </>
      )}
    </div>
  );
}
