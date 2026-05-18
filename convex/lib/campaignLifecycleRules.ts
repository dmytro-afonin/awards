import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { normalizeCampaignLifecycle } from "./campaignLifecycleNormalize";
import { assertCanLaunchContent } from "./campaignReady";

function lifecycleState(doc: Doc<"campaigns">) {
  return normalizeCampaignLifecycle(doc.lifecycle as string);
}

export function assertCanDeleteCampaign(doc: Doc<"campaigns">): void {
  const state = lifecycleState(doc);
  if (state !== "draft") {
    throw new Error("Only draft campaigns can be deleted.");
  }
}

export function isCampaignContentEditable(
  lifecycle: Doc<"campaigns">["lifecycle"],
): boolean {
  return normalizeCampaignLifecycle(lifecycle as string) === "draft";
}

export function isCampaignMetadataEditable(
  lifecycle: Doc<"campaigns">["lifecycle"],
): boolean {
  return normalizeCampaignLifecycle(lifecycle as string) === "draft";
}

async function assertLaunchReady(
  ctx: QueryCtx | MutationCtx,
  campaignId: Id<"campaigns">,
): Promise<void> {
  await assertCanLaunchContent(ctx, campaignId);
}

export async function assertCanLaunchCampaign(
  ctx: MutationCtx,
  doc: Doc<"campaigns">,
): Promise<void> {
  if (lifecycleState(doc) !== "draft") {
    throw new Error("Only draft campaigns can be launched.");
  }
  await assertLaunchReady(ctx, doc._id);
}

export async function assertCanGoLiveAndVote(
  ctx: MutationCtx,
  doc: Doc<"campaigns">,
): Promise<void> {
  if (lifecycleState(doc) !== "draft") {
    throw new Error("Only draft campaigns can go live with voting.");
  }
  await assertLaunchReady(ctx, doc._id);
}

export function assertCanOpenVoting(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "launched") {
    throw new Error("Only launched campaigns can open voting.");
  }
}

export function assertCanCloseVoting(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "vote_live") {
    throw new Error("Only live voting campaigns can close voting.");
  }
}

export async function assertCanFinishCampaign(
  ctx: MutationCtx,
  doc: Doc<"campaigns">,
): Promise<void> {
  if (lifecycleState(doc) !== "vote_ended") {
    throw new Error("Only campaigns with closed voting can be finished.");
  }

  const categories = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign", (q) => q.eq("campaignId", doc._id))
    .collect();

  if (categories.length === 0) {
    throw new Error("Campaign has no categories.");
  }

  for (const category of categories) {
    const status = category.categoryStatus ?? "open";
    if (status !== "finished" || !category.winnerNomineeId) {
      throw new Error(
        `Finalize every category before finishing the campaign (${category.name} is not finished).`,
      );
    }
  }
}

export function assertCanArchiveCampaign(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "finished") {
    throw new Error("Only finished campaigns can be archived.");
  }
  if (doc.lifecycle === "archived") {
    throw new Error("Campaign is already archived.");
  }
}

export function assertCanFinalizeCategory(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "vote_ended") {
    throw new Error("Categories can only be finalized after voting ends.");
  }
}
