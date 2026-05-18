import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

export async function computeAutoWinnerNomineeId(
  ctx: QueryCtx,
  categoryId: Id<"campaignCategories">,
  campaignId: Id<"campaigns">,
): Promise<Id<"campaignNominees"> | undefined> {
  const nominees = await ctx.db
    .query("campaignNominees")
    .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
    .collect();

  if (nominees.length === 0) {
    return undefined;
  }

  const votes = await ctx.db
    .query("categoryVotes")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();

  const countByNominee = new Map<Id<"campaignNominees">, number>();
  for (const vote of votes) {
    if (vote.categoryId !== categoryId) continue;
    countByNominee.set(
      vote.nomineeId,
      (countByNominee.get(vote.nomineeId) ?? 0) + 1,
    );
  }

  const sorted = [...nominees].sort((a, b) => a.sortOrder - b.sortOrder);
  let best: (typeof sorted)[number] | undefined;
  let bestCount = -1;

  for (const nominee of sorted) {
    const count = countByNominee.get(nominee._id) ?? 0;
    if (count > bestCount) {
      best = nominee;
      bestCount = count;
    }
  }

  return best?._id;
}
