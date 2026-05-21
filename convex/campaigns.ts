import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  type MutationCtx,
  mutation,
  type QueryCtx,
  query,
} from "./_generated/server";
import { requireAdminMembership } from "./lib/access";
import {
  isLegacyLaunchedLifecycle,
  normalizeCampaignLifecycle,
  patchCampaignLifecycleIfLegacy,
} from "./lib/campaignLifecycleNormalize";
import {
  assertCanArchiveCampaign,
  assertCanCloseVoting,
  assertCanDeleteCampaign,
  assertCanFinishCampaign,
  assertCanGoLiveAndVote,
  assertCanLaunchCampaign,
  assertCanOpenVoting,
  isCampaignMetadataEditable,
} from "./lib/campaignLifecycleRules";
import { syncCampaignContentCounts } from "./lib/campaignReady";
import { resolveUniqueSlug } from "./lib/campaignSlug";
import { resolveUniqueCategorySlug } from "./lib/categorySlug";
import { computeAutoWinnerNomineeId } from "./lib/categoryWinner";
import {
  assertImageStorageObject,
  deleteStorageFile,
  resolveStorageImageUrl,
} from "./lib/images";
import { slugifyName, uniqueSlugSuffix } from "./lib/slug";
import { campaignLifecycle, campaignVisibility } from "./schema";

const campaignRow = v.object({
  _id: v.id("campaigns"),
  _creationTime: v.number(),
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  slug: v.string(),
  visibility: campaignVisibility,
  lifecycle: campaignLifecycle,
  votingStartsAt: v.optional(v.number()),
  votingEndsAt: v.optional(v.number()),
  imageUrl: v.optional(v.string()),
  categories: v.array(v.string()),
  categoryCount: v.number(),
  nomineeCount: v.number(),
  memberCount: v.number(),
  voteCount: v.number(),
  votePercent: v.number(),
});

function toCampaignRowBase(
  doc: Doc<"campaigns">,
  imageUrl: string | undefined,
) {
  const lifecycle = normalizeCampaignLifecycle(doc.lifecycle as string);
  return {
    _id: doc._id,
    _creationTime: doc._creationTime,
    workspaceId: doc.workspaceId,
    name: doc.name,
    description: doc.description,
    slug: doc.slug,
    visibility: doc.visibility,
    lifecycle,
    votingStartsAt: doc.votingStartsAt,
    votingEndsAt: doc.votingEndsAt,
    imageUrl,
    categories: doc.categories ?? [],
    categoryCount: doc.categoryCount,
    nomineeCount: doc.nomineeCount,
  };
}

async function toCampaignRow(ctx: QueryCtx, doc: Doc<"campaigns">) {
  const imageUrl =
    (await resolveStorageImageUrl(ctx, doc.imageStorageId)) ?? doc.imageUrl;
  return toCampaignRowBase(doc, imageUrl);
}

async function countWorkspaceMembers(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
): Promise<number> {
  const members = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) => q.eq("workspaceId", workspaceId))
    .collect();
  return members.length;
}

async function countCategoryVotes(
  ctx: QueryCtx,
  campaignId: Id<"campaigns">,
): Promise<number> {
  const votes = await ctx.db
    .query("categoryVotes")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();
  return votes.length;
}

function computeVotePercent(
  voteCount: number,
  memberCount: number,
  categoryCount: number,
): number {
  const capacity = memberCount * categoryCount;
  if (capacity <= 0) {
    return 0;
  }
  return Math.round((voteCount / capacity) * 100);
}

async function attachParticipationStats(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  rows: Awaited<ReturnType<typeof toCampaignRow>>[],
) {
  const memberCount = await countWorkspaceMembers(ctx, workspaceId);
  return Promise.all(
    rows.map(async (row) => {
      const voteCount = await countCategoryVotes(ctx, row._id);
      return {
        ...row,
        memberCount,
        voteCount,
        votePercent: computeVotePercent(
          voteCount,
          memberCount,
          row.categoryCount,
        ),
      };
    }),
  );
}

async function migrateLegacyCategories(
  ctx: MutationCtx,
  doc: Doc<"campaigns">,
) {
  const legacy = doc.categories ?? [];
  if (legacy.length === 0) return;

  const existing = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign", (q) => q.eq("campaignId", doc._id))
    .first();
  if (existing) return;

  for (let i = 0; i < legacy.length; i++) {
    const name = legacy[i]?.trim();
    if (!name) continue;
    const slug = await resolveUniqueCategorySlug(ctx, doc._id, name);
    await ctx.db.insert("campaignCategories", {
      campaignId: doc._id,
      name,
      slug,
      sortOrder: i,
    });
  }
  await ctx.db.patch(doc._id, { categories: undefined });
  await syncCampaignContentCounts(ctx, doc._id);
}

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
    const [row] = await attachParticipationStats(ctx, doc.workspaceId, [
      await toCampaignRow(ctx, doc),
    ]);
    return row ?? null;
  },
});

export const listForWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    lifecycles: v.optional(v.array(campaignLifecycle)),
    search: v.optional(v.string()),
  },
  returns: v.array(campaignRow),
  handler: async (ctx, args) => {
    try {
      await requireAdminMembership(ctx, args.workspaceId);
    } catch {
      return [];
    }

    const rows = await ctx.db
      .query("campaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const baseRows = await Promise.all(
      rows.map((doc) => toCampaignRow(ctx, doc)),
    );

    let filtered = baseRows;
    if (args.lifecycles !== undefined) {
      if (args.lifecycles.length === 0) {
        return [];
      }
      const allowed = new Set(args.lifecycles);
      filtered = filtered.filter((c) => allowed.has(c.lifecycle));
    } else {
      filtered = filtered.filter((c) => c.lifecycle !== "archived");
    }

    const search = args.search?.trim().toLowerCase();
    if (search) {
      filtered = filtered.filter((c) => {
        const haystack = `${c.name} ${c.description ?? ""}`.toLowerCase();
        return haystack.includes(search);
      });
    }

    return attachParticipationStats(ctx, args.workspaceId, filtered);
  },
});

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.optional(campaignVisibility),
    slug: v.optional(v.string()),
  },
  returns: v.id("campaigns"),
  handler: async (ctx, args) => {
    await requireAdminMembership(ctx, args.workspaceId);

    const name = args.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    const slugSource = args.slug?.trim() || name;
    let slug = slugifyName(slugSource);
    if (!slug) {
      throw new Error("Slug is required");
    }

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
    slug: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) {
      throw new Error("Campaign not found");
    }
    await requireAdminMembership(ctx, doc.workspaceId);
    await migrateLegacyCategories(ctx, doc);

    const refreshed = await ctx.db.get(args.campaignId);
    if (!refreshed) throw new Error("Campaign not found");

    if (refreshed.lifecycle === "archived") {
      throw new Error("Archived campaigns cannot be edited.");
    }

    if (!isCampaignMetadataEditable(refreshed.lifecycle)) {
      throw new Error("Archived campaigns cannot be edited.");
    }

    const name = args.name.trim();
    if (!name) {
      throw new Error("Name is required");
    }

    const descriptionRaw = args.description?.trim();
    const description =
      descriptionRaw && descriptionRaw.length > 0 ? descriptionRaw : undefined;

    const slug = await resolveUniqueSlug(
      ctx,
      refreshed.workspaceId,
      args.slug,
      refreshed._id,
    );

    await ctx.db.patch(args.campaignId, {
      name,
      description,
      visibility: args.visibility,
      slug,
    });

    return null;
  },
});

export const setImage = mutation({
  args: {
    campaignId: v.id("campaigns"),
    storageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, doc.workspaceId);
    if (!isCampaignMetadataEditable(doc.lifecycle)) {
      throw new Error("Archived campaigns cannot be edited.");
    }
    await assertImageStorageObject(ctx, args.storageId);

    const previousId = doc.imageStorageId;
    await ctx.db.patch(args.campaignId, {
      imageStorageId: args.storageId,
      imageUrl: undefined,
    });
    if (previousId && previousId !== args.storageId) {
      await deleteStorageFile(ctx, previousId);
    }
    return null;
  },
});

export const clearImage = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.campaignId);
    if (!doc) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, doc.workspaceId);
    if (!isCampaignMetadataEditable(doc.lifecycle)) {
      throw new Error("Archived campaigns cannot be edited.");
    }
    await ctx.db.patch(args.campaignId, {
      imageStorageId: undefined,
      imageUrl: undefined,
    });
    await deleteStorageFile(ctx, doc.imageStorageId);
    return null;
  },
});

export const remove = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    assertCanDeleteCampaign(doc);

    await ctx.db.patch(args.campaignId, { lifecycle: "archived" });
    return null;
  },
});

export const archive = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    assertCanArchiveCampaign(doc);

    await ctx.db.patch(args.campaignId, { lifecycle: "archived" });
    return null;
  },
});

export const launch = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    await assertCanLaunchCampaign(ctx, doc);
    await ctx.db.patch(args.campaignId, { lifecycle: "launched" });
    return null;
  },
});

export const goLiveAndVote = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    await assertCanGoLiveAndVote(ctx, doc);
    await ctx.db.patch(args.campaignId, { lifecycle: "vote_live" });
    return null;
  },
});

export const openVoting = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    assertCanOpenVoting(doc);
    await ctx.db.patch(args.campaignId, { lifecycle: "vote_live" });
    return null;
  },
});

export const closeVoting = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    assertCanCloseVoting(doc);

    const categories = await ctx.db
      .query("campaignCategories")
      .withIndex("by_campaign", (q) => q.eq("campaignId", args.campaignId))
      .collect();

    for (const category of categories) {
      const status = category.categoryStatus ?? "open";
      if (status !== "open") continue;
      const winnerNomineeId = await computeAutoWinnerNomineeId(
        ctx,
        category._id,
        args.campaignId,
      );
      await ctx.db.patch(category._id, {
        categoryStatus: "voting_closed",
        winnerNomineeId,
        winnerSource: winnerNomineeId ? "auto" : undefined,
      });
    }

    await ctx.db.patch(args.campaignId, { lifecycle: "vote_ended" });
    return null;
  },
});

export const finishCampaign = mutation({
  args: { campaignId: v.id("campaigns") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const raw = await ctx.db.get(args.campaignId);
    if (!raw) throw new Error("Campaign not found");
    await requireAdminMembership(ctx, raw.workspaceId);
    const doc = await patchCampaignLifecycleIfLegacy(ctx, raw);
    await assertCanFinishCampaign(ctx, doc);
    await ctx.db.patch(args.campaignId, { lifecycle: "finished" });
    return null;
  },
});

/** Persists legacy `started` / `live` values to `launched` for a workspace. */
export const normalizeLegacyLifecycles = mutation({
  args: { workspaceId: v.id("workspaces") },
  returns: v.number(),
  handler: async (ctx, args) => {
    await requireAdminMembership(ctx, args.workspaceId);

    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    let updated = 0;
    for (const doc of campaigns) {
      if (isLegacyLaunchedLifecycle(doc.lifecycle as string)) {
        await ctx.db.patch(doc._id, { lifecycle: "launched" });
        updated += 1;
      }
    }
    return updated;
  },
});
