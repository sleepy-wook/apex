import { TyreStrategyChart } from "@/components/charts/TyreStrategyChart";
import type { PitStrategy } from "@/types/race";

interface StrategySectionProps {
  strategies: PitStrategy[];
  totalLaps: number;
}

export function StrategySection({ strategies, totalLaps }: StrategySectionProps) {
  return (
    <div className="border border-border bg-card">
      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">타이어 전략</h2>
        </div>
        <TyreStrategyChart strategies={strategies} totalLaps={totalLaps} />
      </div>
    </div>
  );
}
