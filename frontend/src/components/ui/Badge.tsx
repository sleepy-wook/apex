import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border border-[var(--color-border-primary)]",
        p1: "bg-[var(--color-p1)]/15 text-[var(--color-p1)] border border-[var(--color-p1)]/30",
        p2: "bg-[var(--color-p2)]/15 text-[var(--color-p2)] border border-[var(--color-p2)]/30",
        p3: "bg-[var(--color-p3)]/15 text-[var(--color-p3)] border border-[var(--color-p3)]/30",
        points: "bg-[var(--color-points)]/15 text-[var(--color-points)]",
        dnf: "bg-[var(--color-dnf)]/15 text-[var(--color-dnf)]",
        success: "bg-[var(--color-success)]/15 text-[var(--color-success)]",
        warning: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
        error: "bg-[var(--color-error)]/15 text-[var(--color-error)]",
      },
      size: {
        sm: "text-xs px-1.5 py-0.5 rounded",
        md: "text-sm px-2 py-0.5 rounded-md",
        lg: "text-base px-3 py-1 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export function PositionBadge({ position }: { position: number }) {
  const variant = position === 1 ? "p1" : position === 2 ? "p2" : position === 3 ? "p3" : position <= 10 ? "points" : "default";
  return (
    <Badge variant={variant} size="sm" className="min-w-[2rem] text-center font-mono">
      P{position}
    </Badge>
  );
}
