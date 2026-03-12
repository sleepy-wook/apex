import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
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
import { notFound } from "next/navigation";

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

  let summary;
  try {
    summary = await getRaceSummary(yearNum, roundNum);
  } catch {
    notFound();
  }

  const [resultsRes, strategyRes] = await Promise.all([
    getRaceResults(yearNum, roundNum).catch(() => ({ results: [] })),
    getStrategy(yearNum, roundNum).catch(() => ({ strategies: [] })),
  ]);

  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: `${yearNum} 시즌`, href: `/seasons/${yearNum}` },
    { label: `Round ${roundNum}` },
  ];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        title={summary.race_name}
        subtitle={`${yearNum} Round ${roundNum}`}
        breadcrumbs={breadcrumbs}
        teamColor={summary.winner.team_colour}
      />

      {/* Race Summary */}
      <section className="mb-8">
        <RaceSummaryCard summary={summary} />
      </section>

      {/* Race Results */}
      <section className="mb-8">
        <Card padding="none">
          <div className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle>레이스 결과</CardTitle>
            </CardHeader>
            <RaceResultTable results={resultsRes.results} />
          </div>
        </Card>
      </section>

      {/* Lap Time Chart */}
      <section className="mb-8">
        <Card padding="none">
          <div className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle>랩 타임</CardTitle>
            </CardHeader>
            <LapTimeChartSection year={yearNum} round={roundNum} />
          </div>
        </Card>
      </section>

      {/* Position Chart */}
      <section className="mb-8">
        <Card padding="none">
          <div className="p-4 sm:p-6">
            <CardHeader>
              <CardTitle>포지션 변화</CardTitle>
            </CardHeader>
            <PositionChartSection
              year={yearNum}
              round={roundNum}
              totalLaps={summary.total_laps}
            />
          </div>
        </Card>
      </section>

      {/* Tyre Strategy */}
      {strategyRes.strategies.length > 0 && (
        <section className="mb-8">
          <StrategySection
            strategies={strategyRes.strategies}
            totalLaps={summary.total_laps}
          />
        </section>
      )}
    </Container>
  );
}
