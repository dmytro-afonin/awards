/** PROTOTYPE — mock IA for public nav exploration. Delete when a variant wins. */

export type NavContext = "site" | "campaign";

export const SITE_NAV = [
  { label: "Home", href: "/" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "News", href: "/news" },
  { label: "FAQ", href: "/faq" },
  { label: "About", href: "/about" },
] as const;

export const CAMPAIGN_NAV = [
  { label: "Campaign", href: "#campaign", active: true },
  { label: "Categories", href: "#categories" },
  { label: "Nominees", href: "#nominees" },
  { label: "Campaign News", href: "#campaign-news" },
  { label: "Best Director", href: "#category", activeCategory: true },
] as const;

export const USER_MENU = [
  { label: "My votes", href: "/my-votes" },
  { label: "My campaigns", href: "/admin", adminOnly: true },
] as const;

export const MOCK_CAMPAIGN = {
  name: "Studio Awards 2026",
  tagline: "Celebrate the year's standout creative work",
  eventDate: "December 10, 2026",
};
