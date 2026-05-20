import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { slugifyName, uniqueSlugSuffix } from "./slug";

type Ctx = QueryCtx | MutationCtx;

export async function findCategoryBySlug(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
  slug: string,
) {
  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  return await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign_and_slug", (q) =>
      q.eq("campaignId", campaignId).eq("slug", trimmed),
    )
    .first();
}

export async function resolveUniqueCategorySlug(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
  raw: string,
  excludeCategoryId?: Id<"campaignCategories">,
): Promise<string> {
  let slug = slugifyName(raw);
  if (!slug) {
    slug = "category";
  }

  const clash = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign_and_slug", (q) =>
      q.eq("campaignId", campaignId).eq("slug", slug),
    )
    .first();

  if (clash && clash._id !== excludeCategoryId) {
    slug = `${slug}-${uniqueSlugSuffix()}`;
  }

  return slug;
}
