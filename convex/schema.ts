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
  v.literal("ready"),
  v.literal("started"),
  v.literal("finished"),
);

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
    categoryCount: v.number(),
    nomineeCount: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"])
    .index("by_workspace_and_lifecycle", ["workspaceId", "lifecycle"]),
});
