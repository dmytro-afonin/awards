import type { Doc } from "../_generated/dataModel";
import { normalizeCampaignLifecycle } from "./campaignLifecycleNormalize";

function lifecycleState(doc: Doc<"campaigns">) {
  return normalizeCampaignLifecycle(doc.lifecycle as string);
}

export function assertCanDeleteCampaign(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) === "launched") {
    throw new Error(
      "A launched campaign cannot be deleted until it is finished.",
    );
  }
  if (doc.lifecycle === "deleted") {
    throw new Error("Campaign is already deleted.");
  }
}

export function isCampaignContentEditable(
  lifecycle: Doc<"campaigns">["lifecycle"],
): boolean {
  return lifecycle === "draft";
}

export function canRevertReadyToDraft(
  lifecycle: Doc<"campaigns">["lifecycle"],
): boolean {
  return lifecycle === "ready";
}

export function assertCanLaunchCampaign(
  doc: Doc<"campaigns">,
  now: number,
): void {
  if (lifecycleState(doc) !== "ready") {
    throw new Error("Only ready campaigns can be launched.");
  }
  if (doc.votingEndsAt !== undefined && doc.votingEndsAt < now) {
    throw new Error("Cannot launch a campaign whose end date is in the past.");
  }
}

export function assertCanFinishCampaign(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "launched") {
    throw new Error("Only launched campaigns can be finished.");
  }
}

export function assertCanArchiveCampaign(doc: Doc<"campaigns">): void {
  if (lifecycleState(doc) !== "finished") {
    throw new Error("Only finished campaigns can be archived.");
  }
  if (doc.lifecycle === "deleted") {
    throw new Error("Campaign is already archived.");
  }
}
