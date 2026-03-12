import { cn } from "@/lib/utils";

export interface DriverTagProps {
  name: string;
  acronym: string;
  teamColour: string;
  headshotUrl?: string | null;
  size?: "sm" | "md";
  className?: string;
}

export function DriverTag({
  name,
  acronym,
  teamColour,
  headshotUrl,
  size = "md",
  className,
}: DriverTagProps) {
  const color = `#${teamColour.replace("#", "")}`;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="w-1 rounded-full shrink-0"
        style={{
          backgroundColor: color,
          height: size === "sm" ? "1.25rem" : "1.75rem",
        }}
      />
      {headshotUrl && (
        <img
          src={headshotUrl}
          alt={name}
          className={cn(
            "rounded-full object-cover bg-[var(--color-bg-elevated)]",
            size === "sm" ? "w-5 h-5" : "w-7 h-7"
          )}
        />
      )}
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "font-bold",
            size === "sm" ? "text-sm" : "text-base"
          )}
          style={{ color }}
        >
          {acronym}
        </span>
        {size === "md" && (
          <span className="text-sm text-[var(--color-text-secondary)]">
            {name}
          </span>
        )}
      </div>
    </div>
  );
}
