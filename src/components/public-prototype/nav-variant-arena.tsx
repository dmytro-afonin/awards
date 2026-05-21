"use client";

import { RiArrowDownSLine, RiMenuLine, RiUser3Line } from "@remixicon/react";
import Link from "next/link";
import { useState } from "react";
import {
  CAMPAIGN_NAV,
  MOCK_CAMPAIGN,
  type NavContext,
  SITE_NAV,
  USER_MENU,
} from "@/components/public-prototype/public-nav-mock";
import { cn } from "@/lib/utils";

/** Variant A — Arena: Game Awards–inspired split nav, gold on black, campaign tabs below. */
export function NavVariantArena({ context }: { context: NavContext }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuId = "arena-user-menu";
  const mobileMenuId = "arena-mobile-menu";
  const leftNav = SITE_NAV.slice(0, 3);
  const rightNav = SITE_NAV.slice(3);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-amber-500/30 bg-zinc-950/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
          <nav
            className="hidden flex-1 items-center gap-6 lg:flex"
            aria-label="Primary left"
          >
            {leftNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-amber-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="shrink-0 text-center font-heading text-lg font-bold uppercase tracking-[0.35em] text-amber-400 no-underline lg:text-xl"
          >
            Awards
          </Link>

          <div className="hidden flex-1 items-center justify-end gap-6 lg:flex">
            <nav className="flex items-center gap-6" aria-label="Primary right">
              {rightNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-amber-400"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserOpen((o) => !o)}
                aria-expanded={userOpen}
                aria-controls={userMenuId}
                aria-haspopup="menu"
                className="flex items-center gap-2 border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300 hover:bg-amber-500/20"
              >
                <RiUser3Line className="size-4" />
                Account
                <RiArrowDownSLine className="size-4" />
              </button>
              {userOpen ? (
                <div
                  id={userMenuId}
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] border border-amber-500/30 bg-zinc-900 py-1 shadow-xl"
                >
                  {USER_MENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      className={cn(
                        "block px-4 py-2.5 text-sm text-zinc-200 hover:bg-amber-500/10 hover:text-amber-300",
                        "adminOnly" in item &&
                          item.adminOnly &&
                          "border-t border-zinc-800",
                      )}
                      onClick={() => setUserOpen(false)}
                    >
                      {item.label}
                      {"adminOnly" in item && item.adminOnly ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-500/80">
                          Admin
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="flex size-10 items-center justify-center text-amber-400 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls={mobileMenuId}
            aria-label="Open menu"
          >
            <RiMenuLine className="size-6" />
          </button>
        </div>

        {mobileOpen ? (
          <div
            id={mobileMenuId}
            className="border-t border-zinc-800 px-4 py-4 lg:hidden"
          >
            <nav className="flex flex-col gap-3">
              {SITE_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm font-semibold uppercase tracking-widest text-zinc-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-zinc-800 pt-4">
              {USER_MENU.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block py-2 text-sm text-amber-300"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {context === "campaign" ? (
          <div className="border-t border-zinc-800/80 bg-zinc-900/80">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500/90">
                {MOCK_CAMPAIGN.name}
              </p>
              <nav
                className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Campaign"
              >
                {CAMPAIGN_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors",
                      "activeCategory" in item && item.activeCategory
                        ? "border-b-2 border-amber-400 text-amber-300"
                        : "active" in item && item.active
                          ? "border-b-2 border-amber-400 text-white"
                          : "text-zinc-500 hover:text-zinc-200",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-600/15 via-zinc-950 to-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(251,191,36,0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center lg:py-28 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-500">
            {MOCK_CAMPAIGN.eventDate}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold uppercase tracking-tight text-white sm:text-6xl">
            {context === "campaign"
              ? MOCK_CAMPAIGN.name
              : "The awards experience"}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
            {MOCK_CAMPAIGN.tagline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <span className="bg-amber-500 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-950">
              {context === "campaign" ? "Vote now" : "Explore campaigns"}
            </span>
            <span className="border border-zinc-600 px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-300">
              Watch recap
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-3 lg:px-8">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="aspect-[4/3] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
              Nominee {n}
            </p>
            <p className="mt-2 font-heading text-lg text-zinc-200">
              Placeholder card
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
