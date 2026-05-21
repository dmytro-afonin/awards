import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import {
  backfillMissingCategorySlugs,
  countCategoriesMissingSlug,
} from "./lib/categorySlug";

/** One-time: migrate lifecycle enum to draft/launched/vote_live/vote_ended/finished/archived. */
export const migrateToNewLifecycle = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    let updated = 0;
    for (const campaign of campaigns) {
      const raw = campaign.lifecycle as string;
      let next: typeof campaign.lifecycle | null = null;

      if (raw === "ready") next = "draft";
      else if (raw === "deleted") next = "archived";
      else if (raw === "started" || raw === "live") next = "launched";
      else if (raw === "launched") next = "vote_live";

      if (next && next !== campaign.lifecycle) {
        await ctx.db.patch(campaign._id, { lifecycle: next });
        updated += 1;
      }
    }
    return updated;
  },
});

/** Backfill slug on campaignCategories rows created before the slug field existed. Idempotent. */
export const backfillCategorySlugs = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => backfillMissingCategorySlugs(ctx),
});

/** How many categories still need slug backfill (0 = safe to narrow schema to required slug). */
export const categorySlugMigrationStatus = internalQuery({
  args: {},
  returns: v.object({
    missingSlugCount: v.number(),
  }),
  handler: async (ctx) => ({
    missingSlugCount: await countCategoriesMissingSlug(ctx),
  }),
});
