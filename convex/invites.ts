import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashToken, randomToken } from "./lib/tokens";
import { requireCampaignEditor, requireCampaignOwner } from "./lib/access";
import { getOrCreateUserId, getUserId } from "./lib/users";
import { memberRole } from "./schema";

export const listInvites = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    await requireCampaignEditor(ctx, campaignId);
    return await ctx.db
      .query("inviteTokens")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const listAllowlist = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    await requireCampaignEditor(ctx, campaignId);
    return await ctx.db
      .query("emailAllowlist")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();
  },
});

export const listMembers = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    const { campaign } = await requireCampaignEditor(ctx, campaignId);
    const owner = await ctx.db.get(campaign.ownerId);
    const memberships = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
      .collect();
    const membershipUsers = await Promise.all(
      memberships.map(async (membership) => ({
        membership,
        user: await ctx.db.get(membership.userId),
      }))
    );
    const rows = [
      {
        userId: campaign.ownerId,
        role: "owner" as const,
        name: owner?.name,
        email: owner?.email,
        image: owner?.image,
      },
      ...membershipUsers
        .filter(({ user }) => user !== null)
        .map(({ membership, user }) => ({
          userId: membership.userId,
          role: membership.role,
          name: user?.name,
          email: user?.email,
          image: user?.image,
        })),
    ];
    return rows.sort((a, b) => {
      if (a.role === "owner") return -1;
      if (b.role === "owner") return 1;
      return (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "");
    });
  },
});

export const generateInvite = mutation({
  args: {
    campaignId: v.id("campaigns"),
    label: v.optional(v.string()),
    expiresInMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireCampaignEditor(ctx, args.campaignId);
    const raw = randomToken();
    const tokenHash = await hashToken(raw);
    const now = Date.now();
    await ctx.db.insert("inviteTokens", {
      campaignId: args.campaignId,
      tokenHash,
      label: args.label,
      expiresAt: args.expiresInMs ? now + args.expiresInMs : undefined,
      revoked: false,
      createdAt: now,
    });
    return { token: raw };
  },
});

export const revokeInvite = mutation({
  args: { inviteId: v.id("inviteTokens") },
  handler: async (ctx, { inviteId }) => {
    const row = await ctx.db.get(inviteId);
    if (!row) throw new Error("Not found");
    await requireCampaignEditor(ctx, row.campaignId);
    await ctx.db.patch(inviteId, { revoked: true });
  },
});

export const addAllowlistEmail = mutation({
  args: {
    campaignId: v.id("campaigns"),
    email: v.string(),
  },
  handler: async (ctx, { campaignId, email }) => {
    await requireCampaignEditor(ctx, campaignId);
    const emailNormalized = email.trim().toLowerCase();
    const existing = await ctx.db
      .query("emailAllowlist")
      .withIndex("by_campaign_email", (q) =>
        q.eq("campaignId", campaignId).eq("emailNormalized", emailNormalized)
      )
      .unique();
    if (existing) return existing._id;
    return await ctx.db.insert("emailAllowlist", {
      campaignId,
      emailNormalized,
      createdAt: Date.now(),
    });
  },
});

export const removeAllowlistEmail = mutation({
  args: { id: v.id("emailAllowlist") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Not found");
    await requireCampaignEditor(ctx, row.campaignId);
    await ctx.db.delete(id);
  },
});

/** Redeem invite: adds user as viewer (or upgrade if already member). */
export const redeemInvite = mutation({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const userId = await getOrCreateUserId(ctx);
    const tokenHash = await hashToken(token);
    const row = await ctx.db
      .query("inviteTokens")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (!row || row.revoked) throw new Error("Invalid invite");
    if (row.expiresAt && row.expiresAt < Date.now()) throw new Error("Invite expired");
    const existing = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign_user", (q) =>
        q.eq("campaignId", row.campaignId).eq("userId", userId)
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("campaignMembers", {
        campaignId: row.campaignId,
        userId,
        role: "viewer",
      });
    }
    return { campaignId: row.campaignId };
  },
});

export const setMemberRole = mutation({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
    role: memberRole,
  },
  handler: async (ctx, args) => {
    await requireCampaignOwner(ctx, args.campaignId);
    const self = await getUserId(ctx);
    if (self === args.userId) throw new Error("Cannot change own role here");
    const existing = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign_user", (q) =>
        q.eq("campaignId", args.campaignId).eq("userId", args.userId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { role: args.role });
    } else {
      await ctx.db.insert("campaignMembers", {
        campaignId: args.campaignId,
        userId: args.userId,
        role: args.role,
      });
    }
  },
});

export const removeMember = mutation({
  args: {
    campaignId: v.id("campaigns"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireCampaignOwner(ctx, args.campaignId);
    const self = await getUserId(ctx);
    if (self === args.userId) throw new Error("Cannot remove yourself");
    const membership = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign_user", (q) =>
        q.eq("campaignId", args.campaignId).eq("userId", args.userId)
      )
      .unique();
    if (!membership) throw new Error("Member not found");
    await ctx.db.delete(membership._id);
  },
});
