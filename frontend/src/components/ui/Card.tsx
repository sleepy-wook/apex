import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)]",
        elevated: "bg-[var(--color-bg-elevated)] shadow-md",
        outlined: "border border-[var(--color-border-primary)] bg-transparent",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export function Card({ className, variant, padding, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, padding }), className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider", className)}
      {...props}
    />
  );
}
