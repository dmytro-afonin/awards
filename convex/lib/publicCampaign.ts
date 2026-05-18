import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { getMembership } from "./access";
import { normalizeCampaignLifecycle } from "./campaignLifecycleNormalize";
import { resolveStorageImageUrl } from "./images";

export type PublicLifecycle =
  | "launched"
  | "vote_live"
  | "vote_ended"
  | "finished";

export function isPubliclyVisibleLifecycle(
  lifecycle: Doc<"campaigns">["lifecycle"],
): lifecycle is PublicLifecycle {
  const normalized = normalizeCampaignLifecycle(lifecycle as string);
  return (
    normalized === "launched" ||
    normalized === "vote_live" ||
    normalized === "vote_ended" ||
    normalized === "finished"
  );
}

export function isVotingOpen(
  campaign: Doc<"campaigns">,
  _now: number,
): boolean {
  const lifecycle = normalizeCampaignLifecycle(campaign.lifecycle as string);
  return lifecycle === "vote_live";
}

export async function isWorkspaceMember(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users"> | null,
): Promise<boolean> {
  if (!userId) {
    return false;
  }
  const membership = await getMembership(ctx, workspaceId, userId);
  return membership !== null;
}

export async function canViewCampaign(
  ctx: QueryCtx,
  campaign: Doc<"campaigns">,
  userId: Id<"users"> | null,
): Promise<boolean> {
  if (!isPubliclyVisibleLifecycle(campaign.lifecycle)) {
    return false;
  }
  if (campaign.visibility === "public") {
    return true;
  }
  return await isWorkspaceMember(ctx, campaign.workspaceId, userId);
}

export async function canVoteOnCampaign(
  ctx: QueryCtx,
  campaign: Doc<"campaigns">,
  userId: Id<"users"> | null,
  now: number,
): Promise<boolean> {
  if (!userId || !isVotingOpen(campaign, now)) {
    return false;
  }
  if (campaign.visibility === "public") {
    return true;
  }
  return await isWorkspaceMember(ctx, campaign.workspaceId, userId);
}

export async function resolveCampaignImageUrl(
  ctx: QueryCtx,
  campaign: Doc<"campaigns">,
): Promise<string | undefined> {
  return (
    (await resolveStorageImageUrl(ctx, campaign.imageStorageId)) ??
    campaign.imageUrl
  );
}

export async function findCampaignBySlug(
  ctx: QueryCtx,
  slug: string,
  workspaceId?: Id<"workspaces">,
): Promise<Doc<"campaigns"> | null> {
  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  if (workspaceId) {
    return await ctx.db
      .query("campaigns")
      .withIndex("by_workspace_and_slug", (q) =>
        q.eq("workspaceId", workspaceId).eq("slug", trimmed),
      )
      .first();
  }

  const matches = await ctx.db
    .query("campaigns")
    .filter((q) => q.eq(q.field("slug"), trimmed))
    .collect();

  if (matches.length !== 1) {
    return null;
  }
  return matches[0] ?? null;
}
