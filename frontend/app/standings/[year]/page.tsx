import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { getDriverStandings, getConstructorStandings } from "@/lib/api";
import { StandingsTabs } from "./_components/StandingsTabs";
import { notFound } from "next/navigation";

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

  let driverStandings;
  let constructorStandings;

  try {
    [driverStandings, constructorStandings] = await Promise.all([
      getDriverStandings(yearNum),
      getConstructorStandings(yearNum),
    ]);
  } catch {
    notFound();
  }

  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: `${yearNum} 시즌`, href: `/seasons/${yearNum}` },
    { label: "스탠딩" },
  ];

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        title={`${yearNum} 챔피언십`}
        subtitle={`Round ${driverStandings.round} 기준`}
        breadcrumbs={breadcrumbs}
      />

      <StandingsTabs
        driverStandings={driverStandings.standings}
        constructorStandings={constructorStandings.standings}
      />
    </Container>
  );
}
