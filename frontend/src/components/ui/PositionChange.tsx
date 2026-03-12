import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

export interface PositionChangeProps {
  gained: number;
  className?: string;
}

export function PositionChange({ gained, className }: PositionChangeProps) {
  if (gained > 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-[var(--color-success)] font-mono text-sm", className)}>
        <ChevronUp size={14} />
        {gained}
      </span>
    );
  }

  if (gained < 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-[var(--color-error)] font-mono text-sm", className)}>
        <ChevronDown size={14} />
        {Math.abs(gained)}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center text-[var(--color-text-muted)] font-mono text-sm", className)}>
      <Minus size={14} />
    </span>
  );
}
