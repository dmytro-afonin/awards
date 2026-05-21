import { Migrations } from "@convex-dev/migrations";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";
import { normalizeCampaignLifecycle } from "./lib/campaignLifecycleNormalize";
import {
  countCategoriesMissingSlug,
  resolveUniqueCategorySlug,
} from "./lib/categorySlug";

export const migrations = new Migrations<DataModel>(components.migrations);

/** Backfill slug on categories created before the slug field existed. Idempotent. */
export const backfillCategorySlugs = migrations.define({
  table: "campaignCategories",
  migrateOne: async (ctx, category) => {
    if (category.slug) {
      return;
    }
    const slug = await resolveUniqueCategorySlug(
      ctx,
      category.campaignId,
      category.name,
    );
    await ctx.db.patch(category._id, { slug });
  },
});

/** One-time: migrate legacy lifecycle enum values. Idempotent. */
export const migrateToNewLifecycle = migrations.define({
  table: "campaigns",
  migrateOne: async (ctx, campaign) => {
    const raw = campaign.lifecycle as string;
    let next: typeof campaign.lifecycle | null = null;

    if (raw === "ready") next = "draft";
    else if (raw === "deleted") next = "archived";
    else if (raw === "started" || raw === "live") next = "launched";
    else if (raw === "launched") next = "vote_live";

    if (next && next !== campaign.lifecycle) {
      await ctx.db.patch(campaign._id, { lifecycle: next });
    }
  },
});

export const runAll = migrations.runner([
  internal.migrations.backfillCategorySlugs,
  internal.migrations.migrateToNewLifecycle,
]);

export const run = migrations.runner();

/** How many categories still need slug backfill (0 = slug is required in schema). */
export const categorySlugMigrationStatus = internalQuery({
  args: {},
  returns: v.object({
    missingSlugCount: v.number(),
  }),
  handler: async (ctx) => ({
    missingSlugCount: await countCategoriesMissingSlug(ctx),
  }),
});
