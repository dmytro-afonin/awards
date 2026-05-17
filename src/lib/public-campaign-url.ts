import type { Id } from "@cvx/_generated/dataModel";

export function publicCampaignPath(
  slug: string,
  workspaceId: Id<"workspaces">,
): string {
  const params = new URLSearchParams({ w: workspaceId });
  return `/c/${encodeURIComponent(slug)}?${params.toString()}`;
}

export function publicCategoryPath(
  slug: string,
  workspaceId: Id<"workspaces">,
  categoryId: Id<"campaignCategories">,
): string {
  const params = new URLSearchParams({ w: workspaceId });
  return `/c/${encodeURIComponent(slug)}/categories/${categoryId}?${params.toString()}`;
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
