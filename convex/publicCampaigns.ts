import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { normalizeCampaignLifecycle } from "./lib/campaignLifecycleNormalize";
import { categorySlugForOutput, findCategoryBySlug } from "./lib/categorySlug";
import {
  isCategoryVotingOpen,
  isCategoryWinnerPublic,
  normalizeCategoryStatus,
} from "./lib/categoryStatus";
import { resolveStorageImageUrl } from "./lib/images";
import {
  canViewCampaign,
  canVoteOnCampaign,
  findCampaignBySlug,
  isPubliclyVisibleLifecycle,
  isVotingOpen,
  resolveCampaignImageUrl,
} from "./lib/publicCampaign";
import { getOrCreateUserId, getUserId } from "./lib/users";
import {
  campaignLifecycle,
  campaignVisibility,
  categoryStatus,
} from "./schema";

const publicWinner = v.object({
  _id: v.id("campaignNominees"),
  name: v.string(),
  imageUrl: v.optional(v.string()),
});

const categoryCard = v.object({
  _id: v.id("campaignCategories"),
  name: v.string(),
  slug: v.string(),
  imageUrl: v.optional(v.string()),
  nomineeCount: v.number(),
  selectedNomineeId: v.union(v.id("campaignNominees"), v.null()),
  categoryStatus: categoryStatus,
  winner: v.union(publicWinner, v.null()),
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
    slug: v.string(),
    imageUrl: v.optional(v.string()),
    categoryStatus: categoryStatus,
  }),
  nominees: v.array(nomineeCard),
  selectedNomineeId: v.union(v.id("campaignNominees"), v.null()),
  votingOpen: v.boolean(),
  canVote: v.boolean(),
  winner: v.union(publicWinner, v.null()),
});

async function loadPublicWinner(
  ctx: Parameters<typeof resolveStorageImageUrl>[0],
  category: Doc<"campaignCategories">,
) {
  if (!isCategoryWinnerPublic(category.categoryStatus)) {
    return null;
  }
  if (!category.winnerNomineeId) {
    return null;
  }
  const nominee = await ctx.db.get(category.winnerNomineeId);
  if (!nominee) {
    return null;
  }
  return {
    _id: nominee._id,
    name: nominee.name,
    imageUrl: await resolveStorageImageUrl(ctx, nominee.imageStorageId),
  };
}

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
          .withIndex("by_campaign_and_user", (q) =>
            q.eq("campaignId", campaignId).eq("userId", userId),
          )
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
        slug: categorySlugForOutput(category),
        sortOrder: category.sortOrder,
        imageUrl: await resolveStorageImageUrl(ctx, category.imageStorageId),
        nomineeCount: nominees.length,
        selectedNomineeId: voteByCategory.get(category._id) ?? null,
        categoryStatus: normalizeCategoryStatus(category.categoryStatus),
        winner: await loadPublicWinner(ctx, category),
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
  },
  returns: v.union(publicCampaign, v.null()),
  handler: async (ctx, args) => {
    const now = Date.now();
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
    const votingOpen = isVotingOpen(campaign, now);
    const canVote = await canVoteOnCampaign(ctx, campaign, userId, now);

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
    categorySlug: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
  },
  returns: v.union(publicCategory, v.null()),
  handler: async (ctx, args) => {
    const now = Date.now();
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

    const category = await findCategoryBySlug(
      ctx,
      campaign._id,
      args.categorySlug,
    );
    if (!category) {
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

    const categoryAcceptsVotes = isCategoryVotingOpen(category.categoryStatus);
    const votingOpen = isVotingOpen(campaign, now) && categoryAcceptsVotes;
    const canVote =
      (await canVoteOnCampaign(ctx, campaign, userId, now)) &&
      categoryAcceptsVotes;

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
        slug: categorySlugForOutput(category),
        imageUrl: await resolveStorageImageUrl(ctx, category.imageStorageId),
        categoryStatus: normalizeCategoryStatus(category.categoryStatus),
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
      winner: await loadPublicWinner(ctx, category),
    };
  },
});

export const castVote = mutation({
  args: {
    campaignId: v.id("campaigns"),
    categoryId: v.id("campaignCategories"),
    nomineeId: v.id("campaignNominees"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const userId = await getOrCreateUserId(ctx);
    const campaign = await ctx.db.get(args.campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.campaignId !== campaign._id) {
      throw new Error("Category not found");
    }

    if (!isCategoryVotingOpen(category.categoryStatus)) {
      throw new Error("Voting is closed for this category.");
    }

    const canVote = await canVoteOnCampaign(ctx, campaign, userId, now);
    if (!canVote) {
      throw new Error("Voting is not open for this campaign.");
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

const campaignNomineeRow = v.object({
  _id: v.id("campaignNominees"),
  name: v.string(),
  imageUrl: v.optional(v.string()),
  categoryId: v.id("campaignCategories"),
  categoryName: v.string(),
  voteCount: v.number(),
  sortOrder: v.number(),
  isWinner: v.boolean(),
});

const allNomineesPayload = v.object({
  campaign: v.object({
    _id: v.id("campaigns"),
    workspaceId: v.id("workspaces"),
    name: v.string(),
    slug: v.string(),
  }),
  nominees: v.array(campaignNomineeRow),
});

export const listAllNominees = query({
  args: {
    slug: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
  },
  returns: v.union(allNomineesPayload, v.null()),
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

    const votes = await ctx.db
      .query("categoryVotes")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
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
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
      .collect();

    const rows = await Promise.all(
      categories.map(async (category) => {
        const nominees = await ctx.db
          .query("campaignNominees")
          .withIndex("by_category", (q) => q.eq("categoryId", category._id))
          .collect();

        return Promise.all(
          nominees.map(async (nominee) => ({
            _id: nominee._id,
            name: nominee.name,
            imageUrl: await resolveStorageImageUrl(ctx, nominee.imageStorageId),
            categoryId: category._id,
            categoryName: category.name,
            voteCount: votesByNominee.get(nominee._id) ?? 0,
            sortOrder: nominee.sortOrder,
            categorySortOrder: category.sortOrder,
            isWinner:
              isCategoryWinnerPublic(category.categoryStatus) &&
              category.winnerNomineeId === nominee._id,
          })),
        );
      }),
    );

    const nominees = rows
      .flat()
      .sort(
        (a, b) =>
          a.categorySortOrder - b.categorySortOrder ||
          a.sortOrder - b.sortOrder,
      )
      .map(({ categorySortOrder: _c, ...row }) => row);

    return {
      campaign: {
        _id: campaign._id,
        workspaceId: campaign.workspaceId,
        name: campaign.name,
        slug: campaign.slug,
      },
      nominees,
    };
  },
});

const publicCampaignListItem = v.object({
  _id: v.id("campaigns"),
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  lifecycle: campaignLifecycle,
  visibility: campaignVisibility,
  imageUrl: v.optional(v.string()),
  votingOpen: v.boolean(),
  canVote: v.boolean(),
});

/** Public directory: all public campaigns plus private ones the signed-in user can access. */
export const listDirectory = query({
  args: {},
  returns: v.array(publicCampaignListItem),
  handler: async (ctx) => {
    const now = Date.now();
    const userId = await getUserId(ctx);

    const memberWorkspaceIds = new Set<Id<"workspaces">>();
    if (userId) {
      const memberships = await ctx.db
        .query("workspaceMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      for (const membership of memberships) {
        memberWorkspaceIds.add(membership.workspaceId);
      }
    }

    const campaigns = await ctx.db.query("campaigns").collect();
    const browsable = campaigns.filter((campaign) => {
      if (!isPubliclyVisibleLifecycle(campaign.lifecycle)) {
        return false;
      }
      if (campaign.visibility === "public") {
        return true;
      }
      return memberWorkspaceIds.has(campaign.workspaceId);
    });

    const rows = await Promise.all(
      browsable.map(async (campaign) => ({
        _id: campaign._id,
        workspaceId: campaign.workspaceId,
        name: campaign.name,
        description: campaign.description,
        slug: campaign.slug,
        lifecycle: normalizeCampaignLifecycle(campaign.lifecycle as string),
        visibility: campaign.visibility,
        imageUrl: await resolveCampaignImageUrl(ctx, campaign),
        votingOpen: isVotingOpen(campaign, now),
        canVote: await canVoteOnCampaign(ctx, campaign, userId, now),
      })),
    );

    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});
