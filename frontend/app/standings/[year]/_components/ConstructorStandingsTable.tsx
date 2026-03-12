"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { PositionBadge } from "@/components/ui/Badge";
import type { ConstructorStanding } from "@/types/standing";

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
}

export function ConstructorStandingsTable({
  standings,
}: ConstructorStandingsTableProps) {
  const columns: Column<ConstructorStanding & Record<string, unknown>>[] = [
    {
      key: "position",
      label: "순위",
      align: "center",
      className: "w-16",
      render: (row) => <PositionBadge position={row.position} />,
    },
    {
      key: "constructor_name",
      label: "컨스트럭터",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-1 h-6 rounded-full shrink-0"
            style={{
              backgroundColor: `#${row.team_colour.replace("#", "")}`,
            }}
          />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">
            {row.constructor_name}
          </span>
        </div>
      ),
    },
    {
      key: "wins",
      label: "승수",
      align: "center",
      sortable: true,
      className: "w-16",
      render: (row) => (
        <span className="text-sm font-mono text-[var(--color-text-secondary)]">
          {row.wins > 0 ? row.wins : "-"}
        </span>
      ),
    },
    {
      key: "points",
      label: "포인트",
      align: "right",
      sortable: true,
      className: "w-28",
      render: (row) => {
        const maxPoints = standings[0]?.points ?? 1;
        const pct = (row.points / maxPoints) * 100;
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="hidden sm:block w-24 h-2 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: `#${row.team_colour.replace("#", "")}`,
                }}
              />
            </div>
            <span className="text-sm font-bold font-mono text-[var(--color-text-primary)] min-w-[3.5rem] text-right">
              {row.points}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={standings as (ConstructorStanding & Record<string, unknown>)[]}
      keyExtractor={(row) => row.constructor_id}
    />
  );
}
