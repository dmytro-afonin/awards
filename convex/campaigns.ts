import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUserId, getUserId } from "./lib/users";
import { campaignVisibility } from "./schema";

function normalizeSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = await getUserId(ctx);
    const identityEmail = identity.email?.trim().toLowerCase() ?? null;
    const owned = userId
      ? await ctx.db
          .query("campaigns")
          .withIndex("by_owner", (q) => q.eq("ownerId", userId))
          .collect()
      : [];
    const byId = new Map(owned.map((campaign) => [campaign._id, campaign]));
    if (userId) {
      const memberships = await ctx.db
        .query("campaignMembers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      const membershipCampaigns = await Promise.all(
        memberships.map((member) => ctx.db.get(member.campaignId))
      );
      for (const campaign of membershipCampaigns) {
        if (campaign) {
          byId.set(campaign._id, campaign);
        }
      }
    }
    if (identityEmail) {
      const campaigns = await ctx.db.query("campaigns").collect();
      for (const campaign of campaigns) {
        if (byId.has(campaign._id)) continue;
        const owner = await ctx.db.get(campaign.ownerId);
        if (owner?.email?.trim().toLowerCase() === identityEmail) {
          byId.set(campaign._id, campaign);
          continue;
        }
        const members = await ctx.db
          .query("campaignMembers")
          .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
          .collect();
        for (const member of members) {
          const memberUser = await ctx.db.get(member.userId);
          if (memberUser?.email?.trim().toLowerCase() === identityEmail) {
            byId.set(campaign._id, campaign);
            break;
          }
        }
      }
    }
    return [...byId.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, { id }) => {
    const c = await ctx.db.get(id);
    if (!c) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = await getUserId(ctx);
    if (c.ownerId === userId) return c;
    const identityEmail = identity.email?.trim().toLowerCase() ?? null;
    if (identityEmail) {
      const owner = await ctx.db.get(c.ownerId);
      if (owner?.email?.trim().toLowerCase() === identityEmail) return c;
    }
    if (userId) {
      const member = await ctx.db
        .query("campaignMembers")
        .withIndex("by_campaign_user", (q) =>
          q.eq("campaignId", id).eq("userId", userId)
        )
        .unique();
      if (member) return c;
    }
    if (identityEmail) {
      const members = await ctx.db
        .query("campaignMembers")
        .withIndex("by_campaign", (q) => q.eq("campaignId", id))
        .collect();
      for (const member of members) {
        const memberUser = await ctx.db.get(member.userId);
        if (memberUser?.email?.trim().toLowerCase() === identityEmail) {
          return c;
        }
      }
    }
    return null;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    visibility: campaignVisibility,
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getOrCreateUserId(ctx);
    const slug = normalizeSlug(args.slug);
    if (!slug.length) throw new Error("Invalid slug");
    const existing = await ctx.db
      .query("campaigns")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("Slug already taken");
    const now = Date.now();
    return await ctx.db.insert("campaigns", {
      name: args.name.trim(),
      slug,
      ownerId,
      visibility: args.visibility,
      description: args.description?.trim(),
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    visibility: v.optional(campaignVisibility),
    description: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const ownerId = await getOrCreateUserId(ctx);
    const c = await ctx.db.get(id);
    if (!c) throw new Error("Not found");
    if (c.ownerId !== ownerId) throw new Error("Forbidden");
    const nextSlug = patch.slug !== undefined ? normalizeSlug(patch.slug) : c.slug;
    if (patch.slug !== undefined) {
      if (!nextSlug.length) throw new Error("Invalid slug");
      const clash = await ctx.db
        .query("campaigns")
        .withIndex("by_slug", (q) => q.eq("slug", nextSlug))
        .unique();
      if (clash && clash._id !== id) throw new Error("Slug already taken");
    }
    await ctx.db.patch(id, {
      ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
      ...(patch.slug !== undefined ? { slug: nextSlug } : {}),
      ...(patch.visibility !== undefined ? { visibility: patch.visibility } : {}),
      ...(patch.description !== undefined
        ? { description: patch.description?.trim() }
        : {}),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, { id }) => {
    const ownerId = await getOrCreateUserId(ctx);
    const c = await ctx.db.get(id);
    if (!c) throw new Error("Not found");
    if (c.ownerId !== ownerId) throw new Error("Forbidden");
    const cats = await ctx.db
      .query("categories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const cat of cats) {
      const noms = await ctx.db
        .query("nominees")
        .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
        .collect();
      for (const n of noms) await ctx.db.delete(n._id);
      const fields = await ctx.db
        .query("fieldDefinitions")
        .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
        .collect();
      for (const f of fields) await ctx.db.delete(f._id);
      await ctx.db.delete(cat._id);
    }
    const cf = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const f of cf) await ctx.db.delete(f._id);
    const members = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const m of members) await ctx.db.delete(m._id);
    const allows = await ctx.db
      .query("emailAllowlist")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const a of allows) await ctx.db.delete(a._id);
    const invites = await ctx.db
      .query("inviteTokens")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const i of invites) await ctx.db.delete(i._id);
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_campaign", (q) => q.eq("campaignId", id))
      .collect();
    for (const v of votes) await ctx.db.delete(v._id);
    await ctx.db.delete(id);
  },
});
