import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { slugifyName, uniqueSlugSuffix } from "./slug";

type Ctx = QueryCtx | MutationCtx;

export async function resolveUniqueSlug(
  ctx: Ctx,
  workspaceId: Id<"workspaces">,
  raw: string,
  excludeCampaignId?: Id<"campaigns">,
): Promise<string> {
  let slug = slugifyName(raw);
  if (!slug) {
    throw new Error("Slug is required");
  }

  const clash = await ctx.db
    .query("campaigns")
    .withIndex("by_workspace_and_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", slug),
    )
    .first();

  if (clash && clash._id !== excludeCampaignId) {
    if (excludeCampaignId) {
      throw new Error("Slug is already in use in this workspace");
    }
    slug = `${slug}-${uniqueSlugSuffix()}`;
  }

  return slug;
}
