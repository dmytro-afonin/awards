import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

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
