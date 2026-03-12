import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  teamColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  teamColor,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] mb-2">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} />}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--color-text-secondary)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {teamColor && (
            <div
              className="w-1.5 h-8 rounded-full"
              style={{ backgroundColor: `#${teamColor.replace("#", "")}` }}
            />
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
