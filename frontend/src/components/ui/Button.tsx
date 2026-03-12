import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-[var(--color-info)] text-white hover:bg-[var(--color-info)]/80",
        secondary: "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border-primary)] hover:bg-[var(--color-bg-hover)]",
        ghost: "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
      },
      size: {
        sm: "text-sm px-3 py-1.5 rounded-md gap-1.5",
        md: "text-sm px-4 py-2 rounded-md gap-2",
        lg: "text-base px-6 py-2.5 rounded-lg gap-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
