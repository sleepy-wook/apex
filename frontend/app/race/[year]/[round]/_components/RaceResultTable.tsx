"use client";

import type { DriverRaceResult } from "@/types/race";

interface RaceResultTableProps {
  results: DriverRaceResult[];
}

export function RaceResultTable({ results }: RaceResultTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-center py-3 px-2 text-muted-foreground font-medium w-16">순위</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium">드라이버</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden md:table-cell">팀</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell w-16">그리드</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium w-16">+/-</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell w-16">피트</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-medium w-20">포인트</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-medium hidden lg:table-cell w-24">상태</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row) => {
            const teamColor = `#${row.team_colour.replace("#", "")}`;
            return (
              <tr key={row.driver_number} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="text-center py-3 px-2">
                  <span className={`text-sm font-bold font-mono ${row.position <= 3 ? "text-primary" : "text-foreground"}`}>
                    {row.position}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-0.5 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {row.name_acronym}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {row.full_name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {row.team_name}
                  </span>
                </td>
                <td className="text-center py-3 px-2 hidden sm:table-cell">
                  <span className="text-sm font-mono text-muted-foreground">
                    P{row.grid}
                  </span>
                </td>
                <td className="text-center py-3 px-2">
                  <PositionChangeDisplay gained={row.positions_gained} />
                </td>
                <td className="text-center py-3 px-2 hidden sm:table-cell">
                  <span className="text-sm font-mono text-muted-foreground">
                    {row.pit_count > 0 ? row.pit_count : "-"}
                  </span>
                </td>
                <td className="text-right py-3 px-2">
                  <span className="text-sm font-bold font-mono text-foreground">
                    {row.points > 0 ? row.points : "-"}
                  </span>
                </td>
                <td className="text-center py-3 px-2 hidden lg:table-cell">
                  <span
                    className={`text-xs ${
                      row.status === "Finished"
                        ? "text-muted-foreground"
                        : "text-red-500"
                    }`}
                  >
                    {row.status === "Finished" ? "완주" : row.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PositionChangeDisplay({ gained }: { gained: number }) {
  if (gained > 0) {
    return (
      <span className="text-xs font-mono text-green-600 font-semibold">
        +{gained}
      </span>
    );
  }
  if (gained < 0) {
    return (
      <span className="text-xs font-mono text-red-500 font-semibold">
        {gained}
      </span>
    );
  }
  return (
    <span className="text-xs font-mono text-muted-foreground">
      -
    </span>
  );
}
