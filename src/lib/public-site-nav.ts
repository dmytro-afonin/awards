import type { Id } from "@cvx/_generated/dataModel";
import {
  publicCampaignNewsPath,
  publicCampaignPath,
  publicCategoriesPath,
  publicCategoryPath,
  publicNomineesPath,
} from "@/lib/public-campaign-url";

export const PUBLIC_SITE_NAV = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "News", href: "/news" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
] as const;

export type PublicSiteNavHref = (typeof PUBLIC_SITE_NAV)[number]["href"];

export function isPublicSiteNavHref(href: string): href is PublicSiteNavHref {
  return PUBLIC_SITE_NAV.some((item) => item.href === href);
}

export type CampaignNavItem = {
  label: string;
  href: string;
  match: "campaign" | "categories" | "nominees" | "news" | "category";
};

export function buildCampaignNavItems(args: {
  slug: string;
  workspaceId: Id<"workspaces">;
  activeCategory?: { slug: string; name: string };
}): CampaignNavItem[] {
  const { slug, workspaceId, activeCategory } = args;
  const items: CampaignNavItem[] = [
    {
      label: "Campaign",
      href: publicCampaignPath(slug, workspaceId),
      match: "campaign",
    },
    {
      label: "Categories",
      href: publicCategoriesPath(slug, workspaceId),
      match: "categories",
    },
    {
      label: "Nominees",
      href: publicNomineesPath(slug, workspaceId),
      match: "nominees",
    },
    {
      label: "Campaign News",
      href: publicCampaignNewsPath(slug, workspaceId),
      match: "news",
    },
  ];
  if (activeCategory) {
    items.push({
      label: activeCategory.name,
      href: publicCategoryPath(slug, workspaceId, activeCategory.slug),
      match: "category",
    });
  }
  return items;
}

export type CampaignRouteSegment =
  | "campaign"
  | "categories"
  | "nominees"
  | "news"
  | "category"
  | null;

/** Infer which campaign tab is active from the pathname. */
export function campaignRouteSegment(pathname: string): CampaignRouteSegment {
  if (!pathname.startsWith("/c/")) {
    return null;
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 2) {
    return "campaign";
  }
  if (parts[2] === "categories") {
    return parts.length >= 4 ? "category" : "categories";
  }
  if (parts[2] === "nominees") {
    return "nominees";
  }
  if (parts[2] === "news") {
    return "news";
  }
  return "campaign";
}

export function parseCampaignSlugFromPath(pathname: string): string | null {
  if (!pathname.startsWith("/c/")) {
    return null;
  }
  const slug = pathname.split("/")[2];
  return slug ? decodeURIComponent(slug) : null;
}
