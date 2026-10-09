"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/site.config";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/avatar-96.png"
            alt={site.author}
            width={28}
            height={28}
            className="h-7 w-7 rounded-md"
          />
          <span className="hidden sm:inline">{site.name}</span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm sm:gap-1">
          {site.nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2 py-1.5 transition-colors sm:px-3 ${
                  active
                    ? "bg-[var(--accent)]/10 font-medium text-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--fg)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
