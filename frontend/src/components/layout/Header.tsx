"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  seasons: number[]
  latestYear: number
}

export function Header({ seasons, latestYear }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Detect current year from URL path (e.g. /standings/2024 → 2024)
  const pathYear = pathname.match(/\/(\d{4})/)?.[1]
  const currentYear = pathYear ? Number(pathYear) : latestYear

  const navItems = [
    { href: `/schedule/${currentYear}`, label: "일정" },
    { href: `/drivers/${currentYear}`, label: "드라이버" },
    { href: `/teams/${currentYear}`, label: "팀" },
    { href: `/standings/${currentYear}`, label: "순위" },
    { href: "/guide", label: "가이드" },
  ]

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newYear = e.target.value
    // Replace the year in current path, or navigate to home
    if (pathYear) {
      const newPath = pathname.replace(/\/\d{4}/, `/${newYear}`)
      router.push(newPath)
    } else {
      // On pages without year in URL (home, guide, circuits), just update nav state
      router.push(`/standings/${newYear}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      {/* Top Bar - Brand accent */}
      <div className="h-1 bg-primary" />

      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex h-12 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-0.5 group">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                APEX
              </span>
              <span className="w-1 h-1 bg-primary mt-2" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-5 py-4 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-5 right-5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              ))}
            </nav>

            {/* Year Selector + Live Indicator */}
            <div className="hidden md:flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {seasons.length > 0 ? (
                <select
                  value={currentYear}
                  onChange={handleYearChange}
                  className="bg-transparent text-[11px] font-semibold tracking-wider uppercase text-muted-foreground cursor-pointer border-none outline-none appearance-none pr-4"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right center",
                  }}
                >
                  {seasons.map((y) => (
                    <option key={y} value={y}>
                      {y} 시즌
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground">
                  {currentYear} 시즌
                </span>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 -mr-2"
              aria-label="메뉴"
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`block h-0.5 bg-foreground transition-all duration-200 ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`block h-0.5 bg-foreground transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`block h-0.5 bg-foreground transition-all duration-200 ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden bg-background border-b border-border overflow-hidden transition-all duration-200 ${isMenuOpen ? "max-h-80" : "max-h-0 border-b-0"}`}>
        <nav className="mx-auto max-w-6xl px-4 py-4">
          {/* Mobile Year Selector */}
          {seasons.length > 0 && (
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <select
                value={currentYear}
                onChange={(e) => {
                  handleYearChange(e)
                  setIsMenuOpen(false)
                }}
                className="bg-transparent text-sm font-semibold text-foreground cursor-pointer border-none outline-none flex-1"
              >
                {seasons.map((y) => (
                  <option key={y} value={y}>
                    {y} 시즌
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between py-3 text-[15px] font-medium text-foreground border-b border-border last:border-b-0"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <span className="text-muted-foreground">&rarr;</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
