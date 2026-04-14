import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { categoryStatus } from "./schema";
import { assertCategoryTransition } from "./lib/categoryStatus";
import { requireCampaignEditor, requireCampaignMember } from "./lib/access";

export const listByCampaign = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    await requireCampaignMember(ctx, campaignId);
    const rows = await ctx.db
      .query("categories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();
    return rows.sort((a, b) => a.order - b.order);
  },
});

export const create = mutation({
  args: {
    campaignId: v.id("campaigns"),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireCampaignEditor(ctx, args.campaignId);
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();
    const order = args.order ?? existing.length;
    const now = Date.now();
    return await ctx.db.insert("categories", {
      campaignId: args.campaignId,
      title: args.title.trim(),
      description: args.description?.trim(),
      tags: args.tags ?? [],
      status: "draft",
      order,
      canVote: false,
      showWinner: false,
      updatedAt: now,
    });
  },
});

export const updateMeta = mutation({
  args: {
    id: v.id("categories"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    canVote: v.optional(v.boolean()),
    showWinner: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, imageStorageId, ...patch }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    await ctx.db.patch(id, {
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.description !== undefined ? { description: patch.description?.trim() } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(patch.order !== undefined ? { order: patch.order } : {}),
      ...(imageStorageId !== undefined
        ? { imageStorageId: imageStorageId ?? undefined }
        : {}),
      ...(patch.canVote !== undefined ? { canVote: patch.canVote } : {}),
      ...(patch.showWinner !== undefined ? { showWinner: patch.showWinner } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("categories"),
    status: categoryStatus,
  },
  handler: async (ctx, { id, status }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    assertCategoryTransition(cat.status, status);
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    const noms = await ctx.db
      .query("nominees")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();
    for (const n of noms) await ctx.db.delete(n._id);
    const fields = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();
    for (const f of fields) await ctx.db.delete(f._id);
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_category_user", (q) => q.eq("categoryId", id))
      .collect();
    for (const v of votes) await ctx.db.delete(v._id);
    await ctx.db.delete(id);
  },
});
