import Link from "next/link"

interface FooterProps {
  latestYear: number
}

export function Footer({ latestYear }: FooterProps) {
  const navItems = [
    { href: `/schedule/${latestYear}`, label: "일정" },
    { href: `/drivers/${latestYear}`, label: "드라이버" },
    { href: `/teams/${latestYear}`, label: "팀" },
    { href: `/standings/${latestYear}`, label: "순위" },
    { href: "/guide", label: "가이드" },
  ]

  return (
    <footer className="bg-foreground text-background">
      {/* Top accent bar */}
      <div className="h-1 bg-primary" />

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-0.5 group">
                <span className="font-display text-2xl font-bold tracking-tight text-background">
                  APEX
                </span>
                <span className="w-1.5 h-1.5 bg-primary mt-3" />
              </Link>
              <p className="text-[13px] text-background/60 max-w-xs leading-relaxed">
                한국 F1 팬 커뮤니티
              </p>
              <p className="text-[11px] text-background/40">
                데이터: OpenF1 API &middot; Jolpica-F1 API
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap gap-x-8 gap-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[13px] font-medium text-background/70 hover:text-background transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-[11px] text-background/40">
            &copy; {new Date().getFullYear()} APEX. 비공식 팬 사이트.
          </p>
          <p className="text-[11px] text-background/40">
            Formula 1, FIA와 무관한 비공식 사이트입니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
