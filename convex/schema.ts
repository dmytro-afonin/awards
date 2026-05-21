import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const workspaceRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("member"),
);

export const campaignVisibility = v.union(
  v.literal("public"),
  v.literal("private"),
);

export const campaignLifecycle = v.union(
  v.literal("draft"),
  v.literal("launched"),
  v.literal("vote_live"),
  v.literal("vote_ended"),
  v.literal("finished"),
  v.literal("archived"),
);

export const categoryStatus = v.union(
  v.literal("open"),
  v.literal("voting_closed"),
  v.literal("finished"),
);

export const winnerSource = v.union(v.literal("auto"), v.literal("override"));

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  workspaces: defineTable({
    name: v.string(),
    isDefault: v.boolean(),
    ownerUserId: v.id("users"),
    imageUrl: v.optional(v.string()),
  }).index("by_owner", ["ownerUserId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    role: workspaceRole,
  })
    .index("by_user", ["userId"])
    .index("by_workspace_and_user", ["workspaceId", "userId"]),

  campaigns: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    visibility: campaignVisibility,
    lifecycle: campaignLifecycle,
    votingStartsAt: v.optional(v.number()),
    votingEndsAt: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    categories: v.optional(v.array(v.string())),
    categoryCount: v.number(),
    nomineeCount: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"])
    .index("by_workspace_and_lifecycle", ["workspaceId", "lifecycle"]),

  campaignCategories: defineTable({
    campaignId: v.id("campaigns"),
    name: v.string(),
    /** Optional until prod backfill completes; see docs/deploy.md and migrations:backfillCategorySlugs */
    slug: v.optional(v.string()),
    sortOrder: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
    categoryStatus: v.optional(categoryStatus),
    winnerNomineeId: v.optional(v.id("campaignNominees")),
    winnerSource: v.optional(winnerSource),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_and_slug", ["campaignId", "slug"]),

  campaignNominees: defineTable({
    categoryId: v.id("campaignCategories"),
    name: v.string(),
    sortOrder: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
  }).index("by_category", ["categoryId"]),

  categoryVotes: defineTable({
    campaignId: v.id("campaigns"),
    categoryId: v.id("campaignCategories"),
    nomineeId: v.id("campaignNominees"),
    userId: v.id("users"),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_and_user", ["campaignId", "userId"])
    .index("by_campaign_and_user_and_category", [
      "campaignId",
      "userId",
      "categoryId",
    ]),
});
