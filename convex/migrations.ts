import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

const LEGACY_LAUNCHED_VALUES = new Set(["started", "live"]);

/** One-time: normalize legacy lifecycle values to `launched`. Run via `bunx convex run internal/migrations:migrateLifecycleToLaunched`. */
export const migrateLifecycleToLaunched = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const campaigns = await ctx.db.query("campaigns").collect();
    let updated = 0;
    for (const campaign of campaigns) {
      if (LEGACY_LAUNCHED_VALUES.has(campaign.lifecycle as string)) {
        await ctx.db.patch(campaign._id, { lifecycle: "launched" });
        updated += 1;
      }
    }
    return updated;
  },
});
