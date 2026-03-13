"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Library, Users, Film, Menu, X } from "lucide-react";
import { useState } from "react";

const guideLinks = [
  { href: "/guide/basics", label: "기본 규칙", icon: BookOpen },
  { href: "/guide/glossary", label: "용어사전", icon: Library },
  { href: "/guide/teams", label: "팀 소개", icon: Users },
  { href: "/guide/media", label: "F1 즐기기", icon: Film },
];

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-6 lg:py-10">
      <div className="flex gap-8">
        {/* Mobile sidebar toggle */}
        <button
          className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="가이드 메뉴"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-48 xl:w-56 shrink-0",
            "bg-background lg:bg-transparent",
            "border-r border-border lg:border-r-0",
            "pt-16 lg:pt-0 px-4 lg:px-0",
            "transition-transform lg:transition-none lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <nav className="sticky top-20">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              가이드
            </h2>
            <ul className="space-y-1">
              {guideLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors",
                        isActive
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
