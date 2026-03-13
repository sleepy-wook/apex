"use client";

import type { ConstructorStanding } from "@/types/standing";

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
}

export function ConstructorStandingsTable({
  standings,
}: ConstructorStandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-center py-3 px-2 text-muted-foreground font-medium w-16">순위</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium">컨스트럭터</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium w-16">승수</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium w-28">포인트</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row) => {
            const maxPoints = standings[0]?.points ?? 1;
            const pct = (row.points / maxPoints) * 100;
            const teamColor = `#${row.team_colour.replace("#", "")}`;
            return (
              <tr key={row.constructor_id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="text-center py-3 px-2">
                  <span className={`text-sm font-bold font-mono ${row.position <= 3 ? "text-primary" : "text-foreground"}`}>
                    {row.position}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-1 h-6 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {row.constructor_name}
                    </span>
                  </div>
                </td>
                <td className="text-center py-3 px-2">
                  <span className="text-sm font-mono text-muted-foreground">
                    {row.wins > 0 ? row.wins : "-"}
                  </span>
                </td>
                <td className="text-right py-3 px-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="hidden sm:block w-24 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: teamColor,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold font-mono text-foreground min-w-[3.5rem] text-right">
                      {row.points}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
