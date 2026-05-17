import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { normalizeCampaignLifecycle } from "./lib/campaignLifecycleNormalize";
import { resolveStorageImageUrl } from "./lib/images";
import {
  canViewCampaign,
  canVoteOnCampaign,
  findCampaignBySlug,
  isVotingOpen,
  resolveCampaignImageUrl,
} from "./lib/publicCampaign";
import { getOrCreateUserId, getUserId } from "./lib/users";
import { campaignLifecycle } from "./schema";

const categoryCard = v.object({
  _id: v.id("campaignCategories"),
  name: v.string(),
  imageUrl: v.optional(v.string()),
  nomineeCount: v.number(),
  selectedNomineeId: v.union(v.id("campaignNominees"), v.null()),
});

const publicCampaign = v.object({
  _id: v.id("campaigns"),
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  lifecycle: campaignLifecycle,
  visibility: v.union(v.literal("public"), v.literal("private")),
  imageUrl: v.optional(v.string()),
  votingOpen: v.boolean(),
  canVote: v.boolean(),
  categories: v.array(categoryCard),
});

const nomineeCard = v.object({
  _id: v.id("campaignNominees"),
  name: v.string(),
  imageUrl: v.optional(v.string()),
});

const publicCategory = v.object({
  campaign: v.object({
    _id: v.id("campaigns"),
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.string(),
    lifecycle: campaignLifecycle,
    visibility: v.union(v.literal("public"), v.literal("private")),
  }),
  category: v.object({
    _id: v.id("campaignCategories"),
    name: v.string(),
    imageUrl: v.optional(v.string()),
  }),
  nominees: v.array(nomineeCard),
  selectedNomineeId: v.union(v.id("campaignNominees"), v.null()),
  votingOpen: v.boolean(),
  canVote: v.boolean(),
});

async function loadCategoryCards(
  ctx: Parameters<typeof canViewCampaign>[0],
  campaignId: Id<"campaigns">,
  userId: Id<"users"> | null,
) {
  const categories = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();

  const userVotes =
    userId === null
      ? []
      : await ctx.db
          .query("categoryVotes")
          .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
          .filter((q) => q.eq(q.field("userId"), userId))
          .collect();

  const voteByCategory = new Map(
    userVotes.map((vote) => [vote.categoryId, vote.nomineeId] as const),
  );

  const cards = await Promise.all(
    categories.map(async (category) => {
      const nominees = await ctx.db
        .query("campaignNominees")
        .withIndex("by_category", (q) => q.eq("categoryId", category._id))
        .collect();
      return {
        _id: category._id,
        name: category.name,
        sortOrder: category.sortOrder,
        imageUrl: await resolveStorageImageUrl(ctx, category.imageStorageId),
        nomineeCount: nominees.length,
        selectedNomineeId: voteByCategory.get(category._id) ?? null,
      };
    }),
  );

  return cards
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ sortOrder: _sortOrder, ...card }) => card);
}

async function getViewableCampaign(
  ctx: Parameters<typeof findCampaignBySlug>[0],
  slug: string,
  workspaceId: Id<"workspaces"> | undefined,
  userId: Id<"users"> | null,
): Promise<Doc<"campaigns"> | null> {
  const campaign = await findCampaignBySlug(ctx, slug, workspaceId);
  if (!campaign) {
    return null;
  }
  const allowed = await canViewCampaign(ctx, campaign, userId);
  return allowed ? campaign : null;
}

export const getBySlug = query({
  args: {
    slug: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    now: v.number(),
  },
  returns: v.union(publicCampaign, v.null()),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const campaign = await getViewableCampaign(
      ctx,
      args.slug,
      args.workspaceId,
      userId,
    );
    if (!campaign) {
      return null;
    }

    const lifecycle = normalizeCampaignLifecycle(campaign.lifecycle as string);
    const votingOpen = isVotingOpen(campaign, args.now);
    const canVote = await canVoteOnCampaign(ctx, campaign, userId, args.now);

    return {
      _id: campaign._id,
      workspaceId: campaign.workspaceId,
      name: campaign.name,
      description: campaign.description,
      slug: campaign.slug,
      lifecycle,
      visibility: campaign.visibility,
      imageUrl: await resolveCampaignImageUrl(ctx, campaign),
      votingOpen,
      canVote,
      categories: await loadCategoryCards(ctx, campaign._id, userId),
    };
  },
});

export const getCategory = query({
  args: {
    slug: v.string(),
    categoryId: v.id("campaignCategories"),
    workspaceId: v.optional(v.id("workspaces")),
    now: v.number(),
  },
  returns: v.union(publicCategory, v.null()),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    const campaign = await getViewableCampaign(
      ctx,
      args.slug,
      args.workspaceId,
      userId,
    );
    if (!campaign) {
      return null;
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.campaignId !== campaign._id) {
      return null;
    }

    const nominees = await ctx.db
      .query("campaignNominees")
      .withIndex("by_category", (q) => q.eq("categoryId", category._id))
      .collect();

    let selectedNomineeId: Id<"campaignNominees"> | null = null;
    if (userId) {
      const existing = await ctx.db
        .query("categoryVotes")
        .withIndex("by_campaign_and_user_and_category", (q) =>
          q
            .eq("campaignId", campaign._id)
            .eq("userId", userId)
            .eq("categoryId", category._id),
        )
        .first();
      selectedNomineeId = existing?.nomineeId ?? null;
    }

    const votingOpen = isVotingOpen(campaign, args.now);
    const canVote = await canVoteOnCampaign(ctx, campaign, userId, args.now);

    return {
      campaign: {
        _id: campaign._id,
        workspaceId: campaign.workspaceId,
        name: campaign.name,
        slug: campaign.slug,
        lifecycle: normalizeCampaignLifecycle(campaign.lifecycle as string),
        visibility: campaign.visibility,
      },
      category: {
        _id: category._id,
        name: category.name,
        imageUrl: await resolveStorageImageUrl(ctx, category.imageStorageId),
      },
      nominees: (
        await Promise.all(
          nominees.map(async (nominee) => ({
            _id: nominee._id,
            name: nominee.name,
            sortOrder: nominee.sortOrder,
            imageUrl: await resolveStorageImageUrl(ctx, nominee.imageStorageId),
          })),
        )
      )
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(({ sortOrder: _sortOrder, ...nominee }) => nominee),
      selectedNomineeId,
      votingOpen,
      canVote,
    };
  },
});

export const castVote = mutation({
  args: {
    campaignId: v.id("campaigns"),
    categoryId: v.id("campaignCategories"),
    nomineeId: v.id("campaignNominees"),
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getOrCreateUserId(ctx);
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const canVote = await canVoteOnCampaign(ctx, campaign, userId, args.now);
    if (!canVote) {
      throw new Error("Voting is not open for this campaign.");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.campaignId !== campaign._id) {
      throw new Error("Category not found");
    }

    const nominee = await ctx.db.get(args.nomineeId);
    if (!nominee || nominee.categoryId !== category._id) {
      throw new Error("Nominee not found");
    }

    const existing = await ctx.db
      .query("categoryVotes")
      .withIndex("by_campaign_and_user_and_category", (q) =>
        q
          .eq("campaignId", campaign._id)
          .eq("userId", userId)
          .eq("categoryId", category._id),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { nomineeId: args.nomineeId });
      return null;
    }

    await ctx.db.insert("categoryVotes", {
      campaignId: campaign._id,
      categoryId: category._id,
      nomineeId: args.nomineeId,
      userId,
    });
    return null;
  },
});
