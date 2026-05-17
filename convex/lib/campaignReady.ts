import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

const MIN_NOMINEES_PER_CATEGORY = 2;

export async function getCategoryNomineeCounts(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
): Promise<
  { categoryId: Id<"campaignCategories">; name: string; nomineeCount: number }[]
> {
  const categories = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();

  const result: {
    categoryId: Id<"campaignCategories">;
    name: string;
    nomineeCount: number;
  }[] = [];

  for (const category of categories) {
    const nominees = await ctx.db
      .query("campaignNominees")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();
    result.push({
      categoryId: category._id,
      name: category.name,
      nomineeCount: nominees.length,
    });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

export async function assertCanMarkReady(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
): Promise<void> {
  const counts = await getCategoryNomineeCounts(ctx, campaignId);
  if (counts.length === 0) {
    throw new Error(
      "Add at least one category with at least two nominees before marking as ready.",
    );
  }
  const invalid = counts.filter(
    (c) => c.nomineeCount < MIN_NOMINEES_PER_CATEGORY,
  );
  if (invalid.length > 0) {
    const names = invalid.map((c) => `"${c.name}"`).join(", ");
    throw new Error(
      `Each category needs at least ${MIN_NOMINEES_PER_CATEGORY} nominees. Update: ${names}.`,
    );
  }
}

export async function syncCampaignContentCounts(
  ctx: MutationCtx,
  campaignId: Id<"campaigns">,
): Promise<void> {
  const counts = await getCategoryNomineeCounts(ctx, campaignId);
  const categoryCount = counts.length;
  const nomineeCount = counts.reduce((sum, c) => sum + c.nomineeCount, 0);
  await ctx.db.patch(campaignId, { categoryCount, nomineeCount });
}
