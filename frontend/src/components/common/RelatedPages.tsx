import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface RelatedLink {
  href: string;
  label: string;
  description: string;
}

interface RelatedPagesProps {
  links: RelatedLink[];
}

export function RelatedPages({ links }: RelatedPagesProps) {
  if (links.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-4 bg-primary" />
        <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
          Explore More
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="border border-border bg-card p-4 hover:bg-muted/50 hover:border-primary/30 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {link.description}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 ml-3"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
