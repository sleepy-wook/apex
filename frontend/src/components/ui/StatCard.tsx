import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  teamColor?: string;
  className?: string;
}

export function StatCard({ label, value, sub, teamColor, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-lg p-4 relative overflow-hidden",
        className
      )}
    >
      {teamColor && (
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: `#${teamColor.replace("#", "")}` }}
        />
      )}
      <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)] font-mono">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{sub}</p>
      )}
    </div>
  );
}
