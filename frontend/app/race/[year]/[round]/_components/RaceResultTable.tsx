"use client";

import { DataTable, type Column } from "@/components/ui/DataTable";
import { PositionBadge } from "@/components/ui/Badge";
import { DriverTag } from "@/components/ui/DriverTag";
import { PositionChange } from "@/components/ui/PositionChange";
import type { DriverRaceResult } from "@/types/race";

interface RaceResultTableProps {
  results: DriverRaceResult[];
}

export function RaceResultTable({ results }: RaceResultTableProps) {
  const columns: Column<DriverRaceResult & Record<string, unknown>>[] = [
    {
      key: "position",
      label: "순위",
      align: "center",
      className: "w-16",
      render: (row) => <PositionBadge position={row.position} />,
    },
    {
      key: "full_name",
      label: "드라이버",
      render: (row) => (
        <DriverTag
          name={row.full_name}
          acronym={row.name_acronym}
          teamColour={row.team_colour}
          headshotUrl={row.headshot_url}
          size="sm"
        />
      ),
    },
    {
      key: "team_name",
      label: "팀",
      className: "hidden md:table-cell",
      render: (row) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {row.team_name}
        </span>
      ),
    },
    {
      key: "grid",
      label: "그리드",
      align: "center",
      className: "hidden sm:table-cell w-16",
      render: (row) => (
        <span className="text-sm font-mono text-[var(--color-text-secondary)]">
          P{row.grid}
        </span>
      ),
    },
    {
      key: "positions_gained",
      label: "+/-",
      align: "center",
      className: "w-16",
      render: (row) => <PositionChange gained={row.positions_gained} />,
    },
    {
      key: "pit_count",
      label: "피트",
      align: "center",
      className: "hidden sm:table-cell w-16",
      render: (row) => (
        <span className="text-sm font-mono text-[var(--color-text-secondary)]">
          {row.pit_count}
        </span>
      ),
    },
    {
      key: "points",
      label: "포인트",
      align: "right",
      sortable: true,
      className: "w-20",
      render: (row) => (
        <span className="text-sm font-bold font-mono text-[var(--color-text-primary)]">
          {row.points > 0 ? row.points : "-"}
        </span>
      ),
    },
    {
      key: "status",
      label: "상태",
      align: "center",
      className: "hidden lg:table-cell w-24",
      render: (row) => (
        <span
          className={`text-xs ${
            row.status === "Finished"
              ? "text-[var(--color-text-tertiary)]"
              : "text-[var(--color-error)]"
          }`}
        >
          {row.status === "Finished" ? "완주" : row.status}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={results as (DriverRaceResult & Record<string, unknown>)[]}
      keyExtractor={(row) => row.driver_number}
    />
  );
}
