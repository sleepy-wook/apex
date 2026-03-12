"use client";

import Link from "next/link";
import { Container } from "./Container";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "홈" },
  { href: "/standings/2024", label: "스탠딩" },
  { href: "/drivers", label: "드라이버" },
  { href: "/compare", label: "비교" },
  { href: "/guide", label: "가이드" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-[var(--color-bg-primary)]/95 backdrop-blur-sm border-b border-[var(--color-border-primary)]">
      <Container className="flex items-center justify-between h-14">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
            APEX
          </span>
          <span className="text-xs font-medium text-[var(--color-text-tertiary)] hidden sm:block">
            F1 DATA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </Container>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]">
          <Container className="py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] rounded-md"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}
