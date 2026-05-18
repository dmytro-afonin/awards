import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { requireAdminMembership } from "./lib/access";
import {
  assertCanFinalizeCategory,
  isCampaignContentEditable,
} from "./lib/campaignLifecycleRules";
import {
  getCategoryNomineeCounts,
  syncCampaignContentCounts,
} from "./lib/campaignReady";
import { computeAutoWinnerNomineeId } from "./lib/categoryWinner";
import {
  assertImageStorageObject,
  deleteStorageFile,
  resolveStorageImageUrl,
} from "./lib/images";

const categoryWithNominees = v.object({
  _id: v.id("campaignCategories"),
  campaignId: v.id("campaigns"),
  name: v.string(),
  sortOrder: v.number(),
  imageUrl: v.optional(v.string()),
  nominees: v.array(
    v.object({
      _id: v.id("campaignNominees"),
      name: v.string(),
      sortOrder: v.number(),
      imageUrl: v.optional(v.string()),
    }),
  ),
});

async function assertCampaignImageEditable(
  ctx: MutationCtx,
  campaignId: Id<"campaigns">,
) {
  const campaign = await ctx.db.get(campaignId);
  if (!campaign) throw new Error("Campaign not found");
  await requireAdminMembership(ctx, campaign.workspaceId);
  if (!isCampaignContentEditable(campaign.lifecycle)) {
    throw new Error("Revert this campaign to draft before editing images.");
  }
  return campaign;
}

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
        const categoryImageUrl = await resolveStorageImageUrl(
          ctx,
          category.imageStorageId,
        );
        return {
          _id: category._id,
          campaignId: category.campaignId,
          name: category.name,
          sortOrder: category.sortOrder,
          imageUrl: categoryImageUrl,
          nominees: (
            await Promise.all(
              nominees.map(async (n) => ({
                _id: n._id,
                name: n.name,
                sortOrder: n.sortOrder,
                imageUrl: await resolveStorageImageUrl(ctx, n.imageStorageId),
              })),
            )
          ).sort((a, b) => a.sortOrder - b.sortOrder),
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
      categoryStatus: "open",
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
      await deleteStorageFile(ctx, nominee.imageStorageId);
      await ctx.db.delete(nominee._id);
    }
    await deleteStorageFile(ctx, category.imageStorageId);
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

    await deleteStorageFile(ctx, nominee.imageStorageId);
    await ctx.db.delete(args.nomineeId);
    await syncCampaignContentCounts(ctx, category.campaignId);
    return null;
  },
});

export const setCategoryImage = mutation({
  args: {
    categoryId: v.id("campaignCategories"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await assertCampaignImageEditable(ctx, category.campaignId);
    await assertImageStorageObject(ctx, args.storageId);

    const previousId = category.imageStorageId;
    await ctx.db.patch(args.categoryId, { imageStorageId: args.storageId });
    if (previousId && previousId !== args.storageId) {
      await deleteStorageFile(ctx, previousId);
    }
    return null;
  },
});

export const clearCategoryImage = mutation({
  args: { categoryId: v.id("campaignCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");
    await assertCampaignImageEditable(ctx, category.campaignId);
    await ctx.db.patch(args.categoryId, { imageStorageId: undefined });
    await deleteStorageFile(ctx, category.imageStorageId);
    return null;
  },
});

export const setNomineeImage = mutation({
  args: {
    nomineeId: v.id("campaignNominees"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) throw new Error("Nominee not found");
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) throw new Error("Category not found");
    await assertCampaignImageEditable(ctx, category.campaignId);
    await assertImageStorageObject(ctx, args.storageId);

    const previousId = nominee.imageStorageId;
    await ctx.db.patch(args.nomineeId, { imageStorageId: args.storageId });
    if (previousId && previousId !== args.storageId) {
      await deleteStorageFile(ctx, previousId);
    }
    return null;
  },
});

export const clearNomineeImage = mutation({
  args: { nomineeId: v.id("campaignNominees") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee) throw new Error("Nominee not found");
    const category = await ctx.db.get(nominee.categoryId);
    if (!category) throw new Error("Category not found");
    await assertCampaignImageEditable(ctx, category.campaignId);
    await ctx.db.patch(args.nomineeId, { imageStorageId: undefined });
    await deleteStorageFile(ctx, nominee.imageStorageId);
    return null;
  },
});

const categoryOverview = v.object({
  _id: v.id("campaignCategories"),
  name: v.string(),
  sortOrder: v.number(),
  imageUrl: v.optional(v.string()),
  categoryStatus: v.union(v.literal("open"), v.literal("finished")),
  winnerNomineeId: v.optional(v.id("campaignNominees")),
  winnerSource: v.optional(v.union(v.literal("auto"), v.literal("override"))),
  voteCount: v.number(),
  nominees: v.array(
    v.object({
      _id: v.id("campaignNominees"),
      name: v.string(),
      sortOrder: v.number(),
      imageUrl: v.optional(v.string()),
      voteCount: v.number(),
    }),
  ),
  leadingNomineeId: v.optional(v.id("campaignNominees")),
});

export const overviewForAdmin = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.array(categoryOverview),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) return [];
    try {
      await requireAdminMembership(ctx, campaign.workspaceId);
    } catch {
      return [];
    }

    const votes = await ctx.db
      .query("categoryVotes")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    const votesByNominee = new Map<Id<"campaignNominees">, number>();
    for (const vote of votes) {
      votesByNominee.set(
        vote.nomineeId,
        (votesByNominee.get(vote.nomineeId) ?? 0) + 1,
      );
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

        const nomineeRows = (
          await Promise.all(
            nominees.map(async (nominee) => ({
              _id: nominee._id,
              name: nominee.name,
              sortOrder: nominee.sortOrder,
              imageUrl: await resolveStorageImageUrl(
                ctx,
                nominee.imageStorageId,
              ),
              voteCount: votesByNominee.get(nominee._id) ?? 0,
            })),
          )
        ).sort((a, b) => a.sortOrder - b.sortOrder);

        const voteCount = nomineeRows.reduce((sum, n) => sum + n.voteCount, 0);
        const leading = nomineeRows.reduce<
          (typeof nomineeRows)[number] | undefined
        >((best, nominee) => {
          if (!best || nominee.voteCount > best.voteCount) return nominee;
          if (
            nominee.voteCount === best.voteCount &&
            nominee.sortOrder < best.sortOrder
          ) {
            return nominee;
          }
          return best;
        }, undefined);

        return {
          _id: category._id,
          name: category.name,
          sortOrder: category.sortOrder,
          imageUrl: await resolveStorageImageUrl(ctx, category.imageStorageId),
          categoryStatus: category.categoryStatus ?? "open",
          winnerNomineeId: category.winnerNomineeId,
          winnerSource: category.winnerSource,
          voteCount,
          nominees: nomineeRows,
          leadingNomineeId:
            category.winnerNomineeId ??
            (leading && leading.voteCount > 0 ? leading._id : undefined),
        };
      }),
    );

    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
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
    canLaunch: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      return { categoryCount: 0, categories: [], canLaunch: false };
    }
    try {
      await requireAdminMembership(ctx, campaign.workspaceId);
    } catch {
      return { categoryCount: 0, categories: [], canLaunch: false };
    }

    const categories = await getCategoryNomineeCounts(ctx, args.campaignId);
    const canLaunch =
      categories.length > 0 && categories.every((c) => c.nomineeCount >= 2);

    return {
      categoryCount: categories.length,
      categories: categories.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        nomineeCount: c.nomineeCount,
      })),
      canLaunch,
    };
  },
});

export const finalizeCategory = mutation({
  args: { categoryId: v.id("campaignCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const campaign = await ctx.db.get(category.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    await requireAdminMembership(ctx, campaign.workspaceId);
    const normalized = await ctx.db.get(campaign._id);
    if (!normalized) throw new Error("Campaign not found");
    assertCanFinalizeCategory(normalized);

    const winnerNomineeId = await computeAutoWinnerNomineeId(
      ctx,
      category._id,
      campaign._id,
    );

    await ctx.db.patch(args.categoryId, {
      categoryStatus: "finished",
      winnerNomineeId,
      winnerSource: winnerNomineeId ? "auto" : undefined,
    });
    return null;
  },
});

export const setCategoryWinner = mutation({
  args: {
    categoryId: v.id("campaignCategories"),
    nomineeId: v.id("campaignNominees"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.categoryId);
    if (!category) throw new Error("Category not found");

    const campaign = await ctx.db.get(category.campaignId);
    if (!campaign) throw new Error("Campaign not found");

    await requireAdminMembership(ctx, campaign.workspaceId);
    assertCanFinalizeCategory(campaign);

    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee || nominee.categoryId !== category._id) {
      throw new Error("Nominee does not belong to this category.");
    }

    await ctx.db.patch(args.categoryId, {
      categoryStatus: "finished",
      winnerNomineeId: args.nomineeId,
      winnerSource: "override",
    });
    return null;
  },
});
