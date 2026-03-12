import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { TyreStrategyChart } from "@/components/charts/TyreStrategyChart";
import type { PitStrategy } from "@/types/race";

interface StrategySectionProps {
  strategies: PitStrategy[];
  totalLaps: number;
}

export function StrategySection({ strategies, totalLaps }: StrategySectionProps) {
  return (
    <Card padding="none">
      <div className="p-4 sm:p-6">
        <CardHeader>
          <CardTitle>타이어 전략</CardTitle>
        </CardHeader>
        <TyreStrategyChart strategies={strategies} totalLaps={totalLaps} />
      </div>
    </Card>
  );
}
