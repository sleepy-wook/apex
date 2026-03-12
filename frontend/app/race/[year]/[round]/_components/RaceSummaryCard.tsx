import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DriverTag } from "@/components/ui/DriverTag";
import type { RaceSummary } from "@/types/race";
import { Trophy } from "lucide-react";

interface RaceSummaryCardProps {
  summary: RaceSummary;
}

export function RaceSummaryCard({ summary }: RaceSummaryCardProps) {
  const raceDate = new Date(summary.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="space-y-4">
      {/* Winner Card */}
      <Card padding="none" className="overflow-hidden">
        <div
          className="h-1.5"
          style={{
            backgroundColor: `#${summary.winner.team_colour.replace("#", "")}`,
          }}
        />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-[var(--color-p1)]/10 flex items-center justify-center shrink-0">
                <Trophy size={24} className="text-[var(--color-p1)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
                  우승
                </p>
                <DriverTag
                  name={summary.winner.full_name}
                  acronym={summary.winner.name_acronym}
                  teamColour={summary.winner.team_colour}
                />
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                  {summary.winner.team_name}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-[var(--color-text-secondary)]">
              <p>{summary.circuit_short_name}, {summary.country_name}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">{raceDate}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="총 랩 수"
          value={summary.total_laps}
          teamColor={summary.winner.team_colour}
        />
        <StatCard
          label="세이프티카"
          value={summary.safety_car_count}
          sub={summary.safety_car_count === 0 ? "배치 없음" : undefined}
        />
        <StatCard
          label="레드 플래그"
          value={summary.red_flag_count}
          sub={summary.red_flag_count === 0 ? "없음" : undefined}
        />
        <StatCard
          label="서킷"
          value={summary.circuit_short_name}
          sub={summary.country_name}
        />
      </div>
    </div>
  );
}
