import type { Id } from "@cvx/_generated/dataModel";

function buildPublicSearch(workspaceId: Id<"workspaces">): string {
  return new URLSearchParams({ w: workspaceId }).toString();
}

export function publicCampaignPath(
  slug: string,
  workspaceId: Id<"workspaces">,
): string {
  return `/c/${encodeURIComponent(slug)}?${buildPublicSearch(workspaceId)}`;
}

export function publicCategoriesPath(
  slug: string,
  workspaceId: Id<"workspaces">,
): string {
  return `/c/${encodeURIComponent(slug)}/categories?${buildPublicSearch(workspaceId)}`;
}

export function publicCategoryPath(
  slug: string,
  workspaceId: Id<"workspaces">,
  categorySlug: string,
): string {
  return `/c/${encodeURIComponent(slug)}/categories/${encodeURIComponent(categorySlug)}?${buildPublicSearch(workspaceId)}`;
}

export function publicNomineesPath(
  slug: string,
  workspaceId: Id<"workspaces">,
): string {
  return `/c/${encodeURIComponent(slug)}/nominees?${buildPublicSearch(workspaceId)}`;
}

export function publicCampaignNewsPath(
  slug: string,
  workspaceId: Id<"workspaces">,
): string {
  return `/c/${encodeURIComponent(slug)}/news?${buildPublicSearch(workspaceId)}`;
}

export function parseWorkspaceIdFromSearch(
  search: string | null | undefined,
): Id<"workspaces"> | undefined {
  if (!search) {
    return undefined;
  }
  const value = new URLSearchParams(search).get("w")?.trim();
  if (!value || value.includes("/")) {
    return undefined;
  }
  return value as Id<"workspaces">;
}
