import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireCampaignEditor, requireCampaignMember } from "./lib/access";

export const generateUploadUrl = mutation({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    await requireCampaignEditor(ctx, campaignId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: {
    campaignId: v.id("campaigns"),
    storageId: v.union(v.id("_storage"), v.null()),
  },
  handler: async (ctx, { campaignId, storageId }) => {
    if (!storageId) return null;
    await requireCampaignMember(ctx, campaignId);
    return await ctx.storage.getUrl(storageId);
  },
});
