import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { getUserId } from "./users";
import { hashToken } from "./tokens";

async function getIdentityEmail(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.email?.trim().toLowerCase() ?? null;
}

async function isOwnerIdentity(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">,
  userId: Id<"users"> | null
) {
  const campaign = await ctx.db.get(campaignId);
  if (!campaign) return { campaign: null, matchedOwnerId: null };
  if (userId && campaign.ownerId === userId) {
    return { campaign, matchedOwnerId: userId };
  }
  const identityEmail = await getIdentityEmail(ctx);
  if (!identityEmail) {
    return { campaign, matchedOwnerId: null };
  }
  const owner = await ctx.db.get(campaign.ownerId);
  if (owner?.email?.trim().toLowerCase() === identityEmail) {
    return { campaign, matchedOwnerId: campaign.ownerId };
  }
  return { campaign, matchedOwnerId: null };
}

async function getMembershipForIdentity(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">,
  userId: Id<"users"> | null
) {
  if (userId) {
    const directMember = await ctx.db
      .query("campaignMembers")
      .withIndex("by_campaign_user", (q) =>
        q.eq("campaignId", campaignId).eq("userId", userId)
      )
      .unique();
    if (directMember) return directMember;
  }
  const identityEmail = await getIdentityEmail(ctx);
  if (!identityEmail) return null;
  const memberships = await ctx.db
    .query("campaignMembers")
    .withIndex("by_campaign", (q) => q.eq("campaignId", campaignId))
    .collect();
  for (const membership of memberships) {
    const memberUser = await ctx.db.get(membership.userId);
    if (memberUser?.email?.trim().toLowerCase() === identityEmail) {
      return membership;
    }
  }
  return null;
}

export async function canViewCampaign(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">,
  opts?: { inviteToken?: string }
): Promise<boolean> {
  const { campaign } = await isOwnerIdentity(ctx, campaignId, null);
  if (!campaign) return false;
  if (campaign.visibility === "public") return true;

  const userId = await getUserId(ctx);
  const ownerCheck = await isOwnerIdentity(ctx, campaignId, userId);
  if (ownerCheck.matchedOwnerId) return true;
  const member = await getMembershipForIdentity(ctx, campaignId, userId);
  if (member) return true;

  const email = await getIdentityEmail(ctx);
  if (email) {
    const allow = await ctx.db
      .query("emailAllowlist")
      .withIndex("by_campaign_email", (q) =>
        q.eq("campaignId", campaignId).eq("emailNormalized", email)
      )
      .unique();
    if (allow) return true;
  }

  if (opts?.inviteToken) {
    const hash = await hashToken(opts.inviteToken);
    const tokenRow = await ctx.db
      .query("inviteTokens")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", hash))
      .unique();
    if (
      tokenRow &&
      !tokenRow.revoked &&
      tokenRow.campaignId === campaignId &&
      (!tokenRow.expiresAt || tokenRow.expiresAt > Date.now())
    ) {
      return true;
    }
  }

  return false;
}

export async function canEditCampaign(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">
): Promise<boolean> {
  const userId = await getUserId(ctx);
  const { campaign, matchedOwnerId } = await isOwnerIdentity(ctx, campaignId, userId);
  if (!campaign) return false;
  if (matchedOwnerId) return true;
  const member = await getMembershipForIdentity(ctx, campaignId, userId);
  return member?.role === "owner" || member?.role === "editor";
}

export async function requireCampaignEditor(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">
) {
  const userId = await getUserId(ctx);
  const { campaign, matchedOwnerId } = await isOwnerIdentity(ctx, campaignId, userId);
  if (!campaign) throw new Error("Campaign not found");
  if (matchedOwnerId) return { userId: matchedOwnerId, campaign };
  const member = await getMembershipForIdentity(ctx, campaignId, userId);
  if (member && (member.role === "owner" || member.role === "editor")) {
    return { userId: member.userId, campaign };
  }
  throw new Error("Forbidden");
}

export async function requireCampaignOwner(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">
) {
  const userId = await getUserId(ctx);
  const { campaign, matchedOwnerId } = await isOwnerIdentity(ctx, campaignId, userId);
  if (!campaign) throw new Error("Campaign not found");
  if (!matchedOwnerId) throw new Error("Forbidden");
  return { userId: matchedOwnerId, campaign };
}

/** Owner, editor, or viewer with membership row. */
export async function requireCampaignMember(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">
) {
  const userId = await getUserId(ctx);
  const { campaign, matchedOwnerId } = await isOwnerIdentity(ctx, campaignId, userId);
  if (!campaign) throw new Error("Campaign not found");
  if (matchedOwnerId) return { userId: matchedOwnerId, campaign };
  const member = await getMembershipForIdentity(ctx, campaignId, userId);
  if (!member) throw new Error("Forbidden");
  return { userId: member.userId, campaign, member };
}
