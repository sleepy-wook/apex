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

  const teamColor = `#${summary.winner.team_colour.replace("#", "")}`;

  return (
    <div className="space-y-4">
      {/* Winner Card */}
      <div className="border border-border bg-card overflow-hidden">
        <div
          className="h-1.5"
          style={{ backgroundColor: teamColor }}
        />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Trophy size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  우승
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-0.5 h-4 rounded-full"
                    style={{ backgroundColor: teamColor }}
                  />
                  <span className="text-sm font-semibold text-foreground">
                    {summary.winner.name_acronym}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {summary.winner.full_name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.winner.team_name}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>{summary.circuit_short_name}, {summary.country_name}</p>
              <p className="text-xs text-muted-foreground">{raceDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem
          label="총 랩 수"
          value={String(summary.total_laps)}
          teamColor={teamColor}
        />
        <StatItem
          label="세이프티카"
          value={String(summary.safety_car_count)}
          sub={summary.safety_car_count === 0 ? "배치 없음" : undefined}
        />
        <StatItem
          label="레드 플래그"
          value={String(summary.red_flag_count)}
          sub={summary.red_flag_count === 0 ? "없음" : undefined}
        />
        <StatItem
          label="서킷"
          value={summary.circuit_short_name}
          sub={summary.country_name}
        />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  sub,
  teamColor,
}: {
  label: string;
  value: string;
  sub?: string;
  teamColor?: string;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </p>
      <p
        className="text-xl font-bold font-mono text-foreground"
        style={teamColor ? { color: teamColor } : undefined}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  );
}
