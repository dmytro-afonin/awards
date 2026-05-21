"use client";

import { RiCloseLine, RiMenuLine, RiUser3Line } from "@remixicon/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CAMPAIGN_NAV,
  MOCK_CAMPAIGN,
  type NavContext,
  SITE_NAV,
  USER_MENU,
} from "@/components/public-prototype/public-nav-mock";
import { cn } from "@/lib/utils";

const SITE_MENU_DIALOG_ID = "spotlight-site-menu";

function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

/** Variant C — Spotlight: transparent header over hero; sticky pill subnav in campaign mode. */
export function NavVariantSpotlight({ context }: { context: NavContext }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const closeMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeMenuButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const dialog = document.getElementById(SITE_MENU_DIALOG_ID);
      if (!dialog) {
        return;
      }

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-neutral-950 to-neutral-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.25),transparent_45%)]" />

        <header
          className={cn(
            "relative z-30 flex items-center justify-between px-4 py-5 md:px-10",
            context === "campaign" && "md:pb-2",
          )}
        >
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls={SITE_MENU_DIALOG_ID}
            aria-label="Open site menu"
          >
            <RiMenuLine className="size-5" />
            <span className="hidden sm:inline">Menu</span>
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 font-heading text-sm font-bold uppercase tracking-[0.5em] text-white no-underline md:text-base"
          >
            Awards
          </Link>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            onClick={() => setUserOpen((o) => !o)}
            aria-label="Account menu"
          >
            <RiUser3Line className="size-5" />
          </button>
        </header>

        {menuOpen ? (
          <div
            id={SITE_MENU_DIALOG_ID}
            className="fixed inset-0 z-50 flex bg-neutral-950/98 backdrop-blur-lg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spotlight-site-menu-title"
          >
            <div className="flex w-full max-w-md flex-col p-8">
              <p id="spotlight-site-menu-title" className="sr-only">
                Site menu
              </p>
              <button
                ref={closeMenuButtonRef}
                type="button"
                className="mb-10 flex w-fit items-center gap-2 text-sm text-neutral-400 hover:text-white"
                onClick={() => setMenuOpen(false)}
              >
                <RiCloseLine className="size-5" />
                Close
              </button>
              <nav className="flex flex-col gap-6">
                {SITE_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="font-heading text-3xl text-white no-underline hover:text-indigo-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-3 border-t border-neutral-800 pt-8">
                {USER_MENU.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block text-neutral-400 hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {userOpen ? (
          <div className="absolute right-4 top-16 z-40 min-w-[10rem] rounded-2xl border border-white/10 bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-xl md:right-10">
            {USER_MENU.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-xl px-4 py-3 text-sm text-neutral-200 hover:bg-white/10"
                onClick={() => setUserOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        <section className="relative z-10 px-4 pb-16 pt-8 text-center md:px-10 md:pb-24 md:pt-4">
          <p className="text-xs uppercase tracking-[0.35em] text-indigo-300/90">
            {context === "campaign" ? "Now voting" : "Public awards hub"}
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold leading-tight text-white md:text-6xl">
            {context === "campaign"
              ? MOCK_CAMPAIGN.name
              : "Where campaigns become events"}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-neutral-400">
            {MOCK_CAMPAIGN.tagline}
          </p>
        </section>
      </div>

      {context === "campaign" ? (
        <div className="sticky top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur-xl">
          <nav
            className="mx-auto flex max-w-4xl gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Campaign"
          >
            {CAMPAIGN_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  "activeCategory" in item && item.activeCategory
                    ? "bg-indigo-500 text-white"
                    : "active" in item && item.active
                      ? "bg-white/15 text-white"
                      : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : (
        <section className="border-t border-white/5 px-4 py-12 md:px-10">
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {SITE_NAV.filter((i) => i.label !== "Home").map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 no-underline hover:border-indigo-500/40 hover:bg-white/[0.07]"
              >
                <span className="text-lg font-medium text-white group-hover:text-indigo-200">
                  {item.label}
                </span>
                <span className="mt-8 text-xs text-neutral-500">Explore →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {context === "campaign" ? (
        <div className="mx-auto max-w-4xl space-y-6 px-4 py-12 md:px-10">
          <h2 className="font-heading text-2xl text-white">Nominees preview</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/10 bg-gradient-to-t from-neutral-900 to-neutral-800/50 p-6"
              >
                <p className="text-xs text-indigo-300">Category slot {n}</p>
                <p className="mt-2 text-lg text-white">Nominee placeholder</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
