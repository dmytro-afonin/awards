"use client";

import { api } from "@cvx/_generated/api";
import { RiMenuLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PublicUserMenu } from "@/components/public/public-user-menu";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";
import {
  buildCampaignNavItems,
  campaignRouteSegment,
  PUBLIC_SITE_NAV,
  parseCampaignSlugFromPath,
} from "@/lib/public-site-nav";
import { cn } from "@/lib/utils";

const siteNavLeft = PUBLIC_SITE_NAV.slice(0, 3);
const siteNavRight = PUBLIC_SITE_NAV.slice(3);

function siteLinkClass(active: boolean) {
  return cn(
    "text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
    active ? "text-amber-400" : "text-zinc-400 hover:text-amber-400",
  );
}

function campaignLinkClass(active: boolean) {
  return cn(
    "shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-colors",
    active
      ? "border-b-2 border-amber-400 text-white"
      : "text-zinc-500 hover:text-zinc-200",
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const campaignSlug =
    typeof params.slug === "string"
      ? params.slug
      : parseCampaignSlugFromPath(pathname);

  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
  const campaign = useQuery(
    api.publicCampaigns.getBySlug,
    campaignSlug ? { slug: campaignSlug, workspaceId } : "skip",
  );

  const categorySlug =
    typeof params.categorySlug === "string" ? params.categorySlug : undefined;

  const activeCategory = useMemo(() => {
    if (!categorySlug || !campaign) {
      return undefined;
    }
    const category = campaign.categories.find((c) => c.slug === categorySlug);
    if (!category) {
      return undefined;
    }
    return { slug: category.slug, name: category.name };
  }, [campaign, categorySlug]);

  const campaignSegment = campaignRouteSegment(pathname);
  const showCampaignNav = Boolean(
    campaignSlug && workspaceId && campaignSegment,
  );

  const campaignNavItems =
    campaignSlug && workspaceId
      ? buildCampaignNavItems({
          slug: campaignSlug,
          workspaceId,
          activeCategory,
        })
      : [];

  return (
    <header className="sticky top-0 z-40 border-b border-amber-500/30 bg-zinc-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <nav
          className="hidden flex-1 items-center gap-6 lg:flex"
          aria-label="Site — left"
        >
          {siteNavLeft.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={siteLinkClass(pathname === item.href)}
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
          <nav className="flex items-center gap-6" aria-label="Site — right">
            {siteNavRight.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={siteLinkClass(pathname === item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <PublicUserMenu />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <PublicUserMenu />
          <button
            type="button"
            className="flex size-10 items-center justify-center text-amber-400"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            <RiMenuLine className="size-6" />
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-zinc-800 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-3" aria-label="Site — mobile">
            {PUBLIC_SITE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold uppercase tracking-widest",
                  pathname === item.href ? "text-amber-400" : "text-zinc-300",
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {showCampaignNav ? (
            <nav
              className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4"
              aria-label="Campaign — mobile"
            >
              {campaign?.name ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/90">
                  {campaign.name}
                </p>
              ) : null}
              {campaignNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    campaignSegment === item.match
                      ? "text-amber-400"
                      : "text-zinc-500",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      ) : null}

      {showCampaignNav ? (
        <div className="border-t border-zinc-800/80 bg-zinc-900/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-amber-500/90">
              {campaign?.name ?? campaignSlug}
            </p>
            <nav
              className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Campaign"
            >
              {campaignNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={campaignLinkClass(campaignSegment === item.match)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
