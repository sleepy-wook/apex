import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { getDrivers } from "@/lib/api";
import type { Driver } from "@/types/driver";

export const revalidate = 86400;

export const metadata = {
  title: "드라이버 | APEX",
  description: "F1 드라이버 프로필 및 통계",
};

export default async function DriversPage() {
  let drivers: Driver[] = [];

  try {
    const res = await getDrivers();
    drivers = res.drivers;
  } catch {
    // Fallback to empty
  }

  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "드라이버" }];

  // Group drivers by team
  const teamGroups = new Map<string, Driver[]>();
  for (const driver of drivers) {
    const team = driver.team_name;
    if (!teamGroups.has(team)) {
      teamGroups.set(team, []);
    }
    teamGroups.get(team)!.push(driver);
  }

  return (
    <Container className="py-6 sm:py-8">
      <PageHeader
        title="드라이버"
        subtitle="현재 시즌 드라이버 목록"
        breadcrumbs={breadcrumbs}
      />

      {drivers.length === 0 ? (
        <Card padding="lg">
          <p className="text-[var(--color-text-secondary)]">
            드라이버 데이터를 불러올 수 없습니다.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {drivers.map((driver) => (
            <DriverCard key={driver.driver_number} driver={driver} />
          ))}
        </div>
      )}
    </Container>
  );
}

function DriverCard({ driver }: { driver: Driver }) {
  const teamColor = `#${driver.team_colour.replace("#", "")}`;

  return (
    <Card
      padding="none"
      className="overflow-hidden hover:border-[var(--color-border-hover)] transition-colors group"
    >
      <div className="h-1" style={{ backgroundColor: teamColor }} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Headshot */}
          <div className="w-14 h-14 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden shrink-0 flex items-center justify-center">
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
            <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
              {driver.first_name}{" "}
              <span className="uppercase">{driver.last_name}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <div
                className="w-0.5 h-3 rounded-full"
                style={{ backgroundColor: teamColor }}
              />
              <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                {driver.team_name}
              </p>
            </div>
            {driver.country_code && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {driver.country_code}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
