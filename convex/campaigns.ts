import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminMembership } from "./lib/access";
import { slugifyName, uniqueSlugSuffix } from "./lib/slug";
import { campaignLifecycle, campaignVisibility } from "./schema";

const campaignRow = v.object({
  _id: v.id("campaigns"),
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
});

export const listForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    lifecycle: v.optional(campaignLifecycle),
    search: v.optional(v.string()),
  },
  returns: v.array(campaignRow),
  handler: async (ctx, args) => {
    try {
      await requireAdminMembership(ctx, args.workspaceId);
    } catch {
      return [];
    }

    let campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    if (args.lifecycle) {
      campaigns = campaigns.filter((c) => c.lifecycle === args.lifecycle);
    }

    const search = args.search?.trim().toLowerCase();
    if (search) {
      campaigns = campaigns.filter((c) => {
        const haystack = `${c.name} ${c.description ?? ""}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    return campaigns
      .map((c) => ({
        _id: c._id,
        workspaceId: c.workspaceId,
        name: c.name,
        description: c.description,
        slug: c.slug,
        visibility: c.visibility,
        lifecycle: c.lifecycle,
        votingStartsAt: c.votingStartsAt,
        votingEndsAt: c.votingEndsAt,
        imageUrl: c.imageUrl,
        categoryCount: c.categoryCount,
        nomineeCount: c.nomineeCount,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.optional(v.string()),
  },
  returns: v.id("campaigns"),
  handler: async (ctx, args) => {
    await requireAdminMembership(ctx, args.workspaceId);

    const name = args.name?.trim() || "Untitled campaign";
    let slug = slugifyName(name);
    const existing = await ctx.db
      .query("campaigns")
      .withIndex("by_workspace_and_slug", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("slug", slug),
      )
      .first();
    if (existing) {
      slug = `${slug}-${uniqueSlugSuffix()}`;
    }

    return await ctx.db.insert("campaigns", {
      workspaceId: args.workspaceId,
      name,
      slug,
      visibility: "private",
      lifecycle: "draft",
      categoryCount: 0,
      nomineeCount: 0,
    });
  },
});
