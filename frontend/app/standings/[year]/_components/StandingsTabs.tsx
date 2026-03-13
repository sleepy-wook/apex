"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
      <div className="flex gap-1 mb-6 bg-secondary p-1 rounded-lg w-fit border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="border border-border bg-card">
        <div className="p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">
              {activeTab === "drivers"
                ? "드라이버 챔피언십"
                : "컨스트럭터 챔피언십"}
            </h2>
          </div>

          {activeTab === "drivers" ? (
            <DriverStandingsTable standings={driverStandings} />
          ) : (
            <ConstructorStandingsTable standings={constructorStandings} />
          )}
        </div>
      </div>
    </div>
  );
}
