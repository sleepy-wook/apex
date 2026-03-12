"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { DriverStandingsTable } from "./DriverStandingsTable";
import { ConstructorStandingsTable } from "./ConstructorStandingsTable";
import type { DriverStanding, ConstructorStanding } from "@/types/standing";

interface StandingsTabsProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
}

type Tab = "drivers" | "constructors";

export function StandingsTabs({
  driverStandings,
  constructorStandings,
}: StandingsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("drivers");

  const tabs: { key: Tab; label: string }[] = [
    { key: "drivers", label: "드라이버" },
    { key: "constructors", label: "컨스트럭터" },
  ];

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1 mb-6 bg-[var(--color-bg-secondary)] p-1 rounded-lg w-fit border border-[var(--color-border-primary)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
              activeTab === tab.key
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] shadow-sm"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Card padding="none">
        <div className="p-4 sm:p-6">
          <CardHeader>
            <CardTitle>
              {activeTab === "drivers"
                ? "드라이버 챔피언십"
                : "컨스트럭터 챔피언십"}
            </CardTitle>
          </CardHeader>

          {activeTab === "drivers" ? (
            <DriverStandingsTable standings={driverStandings} />
          ) : (
            <ConstructorStandingsTable standings={constructorStandings} />
          )}
        </div>
      </Card>
    </div>
  );
}
