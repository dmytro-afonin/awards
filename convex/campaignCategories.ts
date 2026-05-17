import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminMembership } from "./lib/access";
import { isCampaignContentEditable } from "./lib/campaignLifecycleRules";
import {
  getCategoryNomineeCounts,
  syncCampaignContentCounts,
} from "./lib/campaignReady";

const categoryWithNominees = v.object({
  _id: v.id("campaignCategories"),
  campaignId: v.id("campaigns"),
  name: v.string(),
  sortOrder: v.number(),
  nominees: v.array(
    v.object({
      _id: v.id("campaignNominees"),
      name: v.string(),
      sortOrder: v.number(),
    }),
  ),
});

export const listForCampaign = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.array(categoryWithNominees),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return [];
    try {
      await requireAdminMembership(ctx, campaign.workspaceId);
    } catch {
      return [];
    }

    const categories = await ctx.db
      .query("campaignCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const rows = await Promise.all(
      categories.map(async (category) => {
        const nominees = await ctx.db
          .query("campaignNominees")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();
        return {
          _id: category._id,
          campaignId: category.campaignId,
          name: category.name,
          sortOrder: category.sortOrder,
          nominees: nominees
            .map((n) => ({
              _id: n._id,
              name: n.name,
              sortOrder: n.sortOrder,
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder),
        };
      }),
    );

    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const createCategory = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
  },
  returns: v.id("campaignCategories"),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, campaign.workspaceId);
    if (!isCampaignContentEditable(campaign.lifecycle)) {
      throw new Error(
        "Revert this campaign to draft before editing categories.",
      );
    }

    const name = args.name.trim();
    if (!name) throw new Error("Category name is required");

    const existing = await ctx.db
      .query("campaignCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const id = await ctx.db.insert("campaignCategories", {
      campaignId: args.campaignId,
      name,
      sortOrder: existing.length,
    });
    await syncCampaignContentCounts(ctx, args.campaignId);
    return id;
  },
});

export const removeCategory = mutation({
  args: { categoryId: v.id("campaignCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    const campaign = await ctx.db.get(category.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, campaign.workspaceId);
    if (!isCampaignContentEditable(campaign.lifecycle)) {
      throw new Error(
        "Revert this campaign to draft before editing categories.",
      );
    }

    const nominees = await ctx.db
      .query("campaignNominees")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    for (const nominee of nominees) {
      await ctx.db.delete(nominee._id);
    }
    await ctx.db.delete(args.categoryId);
    await syncCampaignContentCounts(ctx, category.campaignId);
    return null;
  },
});

export const addNominee = mutation({
  args: {
    categoryId: v.id("campaignCategories"),
    name: v.string(),
  },
  returns: v.id("campaignNominees"),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    const campaign = await ctx.db.get(category.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, campaign.workspaceId);
    if (!isCampaignContentEditable(campaign.lifecycle)) {
      throw new Error("Revert this campaign to draft before editing nominees.");
    }

    const name = args.name.trim();
    if (!name) throw new Error("Nominee name is required");

    const existing = await ctx.db
      .query("campaignNominees")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const id = await ctx.db.insert("campaignNominees", {
      categoryId: args.categoryId,
      name,
      sortOrder: existing.length,
    });
    await syncCampaignContentCounts(ctx, category.campaignId);
    return id;
  },
});

export const removeNominee = mutation({
  args: { nomineeId: v.id("campaignNominees") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) throw new Error("Nominee not found");
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) throw new Error("Category not found");
    const campaign = await ctx.db.get(category.campaignId);
    if (!campaign) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, campaign.workspaceId);
    if (!isCampaignContentEditable(campaign.lifecycle)) {
      throw new Error("Revert this campaign to draft before editing nominees.");
    }

    await ctx.db.delete(args.nomineeId);
    await syncCampaignContentCounts(ctx, category.campaignId);
    return null;
  },
});

export const readinessSummary = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.object({
    categoryCount: v.number(),
    categories: v.array(
      v.object({
        categoryId: v.id("campaignCategories"),
        name: v.string(),
        nomineeCount: v.number(),
      }),
    ),
    canMarkReady: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return { categoryCount: 0, categories: [], canMarkReady: false };
    }
    try {
      await requireAdminMembership(ctx, campaign.workspaceId);
    } catch {
      return { categoryCount: 0, categories: [], canMarkReady: false };
    }

    const categories = await getCategoryNomineeCounts(ctx, args.campaignId);
    const canMarkReady =
      categories.length > 0 && categories.every((c) => c.nomineeCount >= 2);

    return {
      categoryCount: categories.length,
      categories: categories.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        nomineeCount: c.nomineeCount,
      })),
      canMarkReady,
    };
  },
});
