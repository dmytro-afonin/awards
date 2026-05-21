"use client";

import { RiArrowDownSLine, RiSearchLine } from "@remixicon/react";
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

/** Variant B — Festival: light editorial site; campaign uses a left sidebar rail. */
export function NavVariantFestival({ context }: { context: NavContext }) {
  const [userOpen, setUserOpen] = useState(false);
  const userMenuId = "festival-user-menu";

  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center gap-8 px-4 md:px-8">
          <Link
            href="/"
            className="font-heading text-2xl font-semibold tracking-tight text-stone-900 no-underline"
          >
            Awards
          </Link>
          <nav
            className="hidden flex-1 items-center justify-center gap-8 md:flex"
            aria-label="Site"
          >
            {SITE_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-stone-600 transition-colors hover:text-stone-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="hidden size-9 items-center justify-center text-stone-500 hover:text-stone-800 sm:flex"
              aria-label="Search"
            >
              <RiSearchLine className="size-5" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserOpen((o) => !o)}
                aria-expanded={userOpen}
                aria-controls={userMenuId}
                aria-haspopup="menu"
                className="flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-200"
              >
                You
                <RiArrowDownSLine className="size-4 text-stone-500" />
              </button>
              {userOpen ? (
                <div
                  id={userMenuId}
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
                >
                  {USER_MENU.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      role="menuitem"
                      className="block px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50"
                      onClick={() => setUserOpen(false)}
                    >
                      {item.label}
                      {"adminOnly" in item && item.adminOnly ? (
                        <span className="text-stone-400"> · workspace</span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <nav
          className="flex gap-4 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden"
          aria-label="Site mobile"
        >
          {SITE_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="shrink-0 text-xs font-medium text-stone-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {context === "site" ? (
        <>
          <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
            <p className="text-sm font-medium text-rose-700">Featured</p>
            <h1 className="mt-2 max-w-2xl font-heading text-4xl leading-[1.1] text-stone-900 md:text-5xl">
              Discover award campaigns from studios you follow
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-600">
              News, nominees, and live voting — a public home for every
              campaign, not an admin console.
            </p>
          </section>
          <section className="border-y border-stone-200 bg-white">
            <div className="mx-auto grid max-w-6xl gap-px bg-stone-200 sm:grid-cols-2 md:grid-cols-3">
              {["Campaigns", "News", "About"].map((label) => (
                <div key={label} className="bg-white p-8">
                  <h2 className="font-heading text-xl text-stone-900">
                    {label}
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">Section preview</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-0 md:flex-row md:px-8 md:py-10">
          <aside className="w-full shrink-0 border-b border-stone-200 bg-white md:w-56 md:border-b-0 md:border-r md:pr-6">
            <p className="px-4 pt-6 text-xs font-semibold uppercase tracking-wider text-stone-400 md:px-0">
              In this campaign
            </p>
            <p className="px-4 font-heading text-lg text-stone-900 md:px-0 md:pt-1">
              {MOCK_CAMPAIGN.name}
            </p>
            <nav className="mt-4 flex flex-row gap-1 overflow-x-auto px-2 pb-4 md:flex-col md:gap-0 md:overflow-visible md:px-0 md:pb-0">
              {CAMPAIGN_NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-md px-3 py-2 text-sm md:rounded-none md:border-l-2 md:px-0 md:pl-4",
                    "activeCategory" in item && item.activeCategory
                      ? "bg-stone-900 text-white md:border-l-rose-600 md:bg-transparent md:text-stone-900"
                      : "active" in item && item.active
                        ? "font-medium text-stone-900 md:border-l-rose-600"
                        : "text-stone-500 hover:bg-stone-100 hover:text-stone-800 md:hover:bg-transparent",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="hidden border-t border-stone-100 pt-6 md:block">
              <p className="text-xs text-stone-400">
                {MOCK_CAMPAIGN.eventDate}
              </p>
              <p className="mt-2 text-sm text-stone-600">
                {MOCK_CAMPAIGN.tagline}
              </p>
            </div>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 md:px-10 md:py-0">
            <p className="text-sm text-stone-500">Category page</p>
            <h1 className="mt-2 font-heading text-3xl text-stone-900">
              Best Director
            </h1>
            <p className="mt-4 max-w-prose text-stone-600">
              Nominees listed here with vote affordances. Sidebar stays visible
              while browsing categories and campaign news.
            </p>
            <ul className="mt-10 space-y-4">
              {["Alex Kim", "Jordan Lee", "Sam Rivera"].map((name) => (
                <li
                  key={name}
                  className="flex items-center justify-between border-b border-stone-200 py-4"
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-sm text-rose-700">Vote</span>
                </li>
              ))}
            </ul>
          </main>
        </div>
      )}
    </div>
  );
}
