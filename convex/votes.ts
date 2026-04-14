import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getOrCreateUserId } from "./lib/users";
import { canViewCampaign } from "./lib/access";

export const cast = mutation({
  args: {
    categoryId: v.id("categories"),
    nomineeId: v.id("nominees"),
    inviteToken: v.optional(v.string()),
  },
  handler: async (ctx, { categoryId, nomineeId, inviteToken }) => {
    const userId = await getOrCreateUserId(ctx);
    const cat = await ctx.db.get(categoryId);
    if (!cat) throw new Error("Category not found");
    const canView = await canViewCampaign(ctx, cat.campaignId, { inviteToken });
    if (!canView) throw new Error("Forbidden");
    if (cat.status !== "active") throw new Error("Voting not open");
    const nom = await ctx.db.get(nomineeId);
    if (!nom || nom.categoryId !== categoryId) throw new Error("Invalid nominee");
    const campaignId = cat.campaignId;
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_category_user", (q) =>
        q.eq("categoryId", categoryId).eq("userId", userId)
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        nomineeId,
        campaignId,
        createdAt: now,
      });
    } else {
      await ctx.db.insert("votes", {
        campaignId,
        categoryId,
        userId,
        nomineeId,
        createdAt: now,
      });
    }
  },
});
