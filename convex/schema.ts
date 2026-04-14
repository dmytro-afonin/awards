import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const categoryStatus = v.union(
  v.literal("draft"),
  v.literal("active"),
  v.literal("paused"),
  v.literal("finished")
);

export const campaignVisibility = v.union(v.literal("public"), v.literal("private"));

export const memberRole = v.union(
  v.literal("owner"),
  v.literal("editor"),
  v.literal("viewer")
);

export const fieldType = v.union(
  v.literal("string"),
  v.literal("location"),
  v.literal("date")
);

const fieldValue = v.union(
  v.object({ type: v.literal("string"), value: v.string() }),
  v.object({
    type: v.literal("location"),
    label: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }),
  v.object({ type: v.literal("date"), iso: v.string() })
);

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_token", ["tokenIdentifier"]),

  campaigns: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.id("users"),
    visibility: campaignVisibility,
    description: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_visibility", ["visibility"])
    .index("by_owner", ["ownerId"]),

  categories: defineTable({
    campaignId: v.id("campaigns"),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    status: categoryStatus,
    order: v.number(),
    canVote: v.optional(v.boolean()),
    showWinner: v.optional(v.boolean()),
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_order", ["campaignId", "order"]),

  fieldDefinitions: defineTable({
    campaignId: v.optional(v.id("campaigns")),
    categoryId: v.optional(v.id("categories")),
    scope: v.union(v.literal("campaign"), v.literal("category")),
    key: v.string(),
    label: v.string(),
    type: fieldType,
    required: v.boolean(),
    order: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_scope", ["campaignId", "scope"])
    .index("by_category", ["categoryId"]),

  nominees: defineTable({
    categoryId: v.id("categories"),
    title: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    tags: v.array(v.string()),
    order: v.number(),
    fieldValues: v.record(v.string(), fieldValue),
    isWinner: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_category", ["categoryId"]),

  campaignMembers: defineTable({
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
    role: memberRole,
  })
    .index("by_campaign", ["campaignId"])
    .index("by_user", ["userId"])
    .index("by_campaign_user", ["campaignId", "userId"]),

  emailAllowlist: defineTable({
    campaignId: v.id("campaigns"),
    emailNormalized: v.string(),
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_email", ["campaignId", "emailNormalized"]),

  inviteTokens: defineTable({
    campaignId: v.id("campaigns"),
    tokenHash: v.string(),
    label: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    revoked: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_campaign", ["campaignId"]),

  votes: defineTable({
    campaignId: v.id("campaigns"),
    categoryId: v.id("categories"),
    userId: v.id("users"),
    nomineeId: v.id("nominees"),
    createdAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_category_user", ["categoryId", "userId"])
    .index("by_nominee", ["nomineeId"]),
});
