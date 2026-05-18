import type { Id } from "@cvx/_generated/dataModel";
import type { PublicLayoutId } from "@/lib/public-layout";

function buildPublicSearch(
  workspaceId: Id<"workspaces">,
  layout?: PublicLayoutId | null,
): string {
  const params = new URLSearchParams({ w: workspaceId });
  if (layout) {
    params.set("layout", layout);
  }
  return params.toString();
}

export function publicCampaignPath(
  slug: string,
  workspaceId: Id<"workspaces">,
  layout?: PublicLayoutId | null,
): string {
  return `/c/${encodeURIComponent(slug)}?${buildPublicSearch(workspaceId, layout)}`;
}

export function publicCategoriesPath(
  slug: string,
  workspaceId: Id<"workspaces">,
  layout?: PublicLayoutId | null,
): string {
  return `/c/${encodeURIComponent(slug)}/categories?${buildPublicSearch(workspaceId, layout)}`;
}

export function publicCategoryPath(
  slug: string,
  workspaceId: Id<"workspaces">,
  categoryId: Id<"campaignCategories">,
  layout?: PublicLayoutId | null,
): string {
  return `/c/${encodeURIComponent(slug)}/categories/${categoryId}?${buildPublicSearch(workspaceId, layout)}`;
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
