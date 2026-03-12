"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { PositionBadge } from "@/components/ui/Badge";
import { DriverTag } from "@/components/ui/DriverTag";
import type { DriverStanding } from "@/types/standing";

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

export function DriverStandingsTable({ standings }: DriverStandingsTableProps) {
  const columns: Column<DriverStanding & Record<string, unknown>>[] = [
    {
      key: "position",
      label: "순위",
      align: "center",
      className: "w-16",
      render: (row) => <PositionBadge position={row.position} />,
    },
    {
      key: "driver_name",
      label: "드라이버",
      render: (row) => (
        <DriverTag
          name={row.driver_name}
          acronym={row.name_acronym}
          teamColour={row.team_colour}
          size="sm"
        />
      ),
    },
    {
      key: "team_name",
      label: "팀",
      className: "hidden md:table-cell",
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-0.5 h-4 rounded-full shrink-0"
            style={{ backgroundColor: `#${row.team_colour.replace("#", "")}` }}
          />
          <span className="text-sm text-[var(--color-text-secondary)]">
            {row.team_name}
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
      className: "w-24",
      render: (row) => {
        const maxPoints = standings[0]?.points ?? 1;
        const pct = (row.points / maxPoints) * 100;
        return (
          <div className="flex items-center gap-2 justify-end">
            <div className="hidden sm:block w-20 h-1.5 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: `#${row.team_colour.replace("#", "")}`,
                }}
              />
            </div>
            <span className="text-sm font-bold font-mono text-[var(--color-text-primary)] min-w-[3rem] text-right">
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
      data={standings as (DriverStanding & Record<string, unknown>)[]}
      keyExtractor={(row) => row.driver_id}
    />
  );
}
