import { cn } from "@/lib/utils";
import type { TyreCompound } from "@/types/race";

const tyreConfig: Record<TyreCompound, { color: string; label: string; abbr: string }> = {
  SOFT: { color: "var(--color-tyre-soft)", label: "Soft", abbr: "S" },
  MEDIUM: { color: "var(--color-tyre-medium)", label: "Medium", abbr: "M" },
  HARD: { color: "var(--color-tyre-hard)", label: "Hard", abbr: "H" },
  INTERMEDIATE: { color: "var(--color-tyre-intermediate)", label: "Inter", abbr: "I" },
  WET: { color: "var(--color-tyre-wet)", label: "Wet", abbr: "W" },
};

export interface TyreChipProps {
  compound: TyreCompound;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function TyreChip({
  compound,
  showLabel = false,
  size = "md",
  className,
}: TyreChipProps) {
  const config = tyreConfig[compound];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-bold",
        size === "sm" ? "text-xs" : "text-sm",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-mono font-bold border-2",
          size === "sm" ? "w-5 h-5 text-[10px]" : "w-6 h-6 text-xs"
        )}
        style={{
          borderColor: config.color,
          color: config.color,
        }}
      >
        {config.abbr}
      </span>
      {showLabel && (
        <span className="text-[var(--color-text-secondary)]">{config.label}</span>
      )}
    </span>
  );
}
