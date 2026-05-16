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

export const getForAdmin = query({
  args: { campaignId: v.id("campaigns") },
  returns: v.union(campaignRow, v.null()),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) return null;
    try {
      await requireAdminMembership(ctx, doc.workspaceId);
    } catch {
      return null;
    }
    return {
      _id: doc._id,
      workspaceId: doc.workspaceId,
      name: doc.name,
      description: doc.description,
      slug: doc.slug,
      visibility: doc.visibility,
      lifecycle: doc.lifecycle,
      votingStartsAt: doc.votingStartsAt,
      votingEndsAt: doc.votingEndsAt,
      imageUrl: doc.imageUrl,
      categoryCount: doc.categoryCount,
      nomineeCount: doc.nomineeCount,
    };
  },
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
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.optional(campaignVisibility),
  },
  returns: v.id("campaigns"),
  handler: async (ctx, args) => {
    await requireAdminMembership(ctx, args.workspaceId);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }

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

    const description = args.description?.trim();
    const visibility = args.visibility ?? "private";

    return await ctx.db.insert("campaigns", {
      workspaceId: args.workspaceId,
      name,
      description:
        description && description.length > 0 ? description : undefined,
      slug,
      visibility,
      lifecycle: "draft",
      categoryCount: 0,
      nomineeCount: 0,
    });
  },
});

export const update = mutation({
  args: {
    campaignId: v.id("campaigns"),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: campaignVisibility,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) {
      throw new Error("Campaign not found");
    }
    await requireAdminMembership(ctx, doc.workspaceId);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    const descriptionRaw = args.description?.trim();
    const description =
      descriptionRaw && descriptionRaw.length > 0 ? descriptionRaw : undefined;

    let slug = doc.slug;
    if (name !== doc.name) {
      let candidate = slugifyName(name);
      const clash = await ctx.db
        .query("campaigns")
        .withIndex("by_workspace_and_slug", (q) =>
          q.eq("workspaceId", doc.workspaceId).eq("slug", candidate),
        )
        .first();
      if (clash && clash._id !== doc._id) {
        candidate = `${slugifyName(name)}-${uniqueSlugSuffix()}`;
      }
      slug = candidate;
    }

    await ctx.db.patch(args.campaignId, {
      name,
      description,
      visibility: args.visibility,
      slug,
    });

    return null;
  },
});
