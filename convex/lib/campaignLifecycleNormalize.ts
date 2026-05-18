import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const LEGACY_LAUNCHED_LIFECYCLES = new Set(["started", "live"]);

export type CampaignLifecycle = Doc<"campaigns">["lifecycle"];

/** Map stored or legacy lifecycle strings to the canonical enum value. */
export function normalizeCampaignLifecycle(
  lifecycle: string,
): CampaignLifecycle {
  if (LEGACY_LAUNCHED_LIFECYCLES.has(lifecycle)) {
    return "launched";
  }
  if (lifecycle === "ready") {
    return "draft";
  }
  if (lifecycle === "deleted") {
    return "archived";
  }
  if (
    lifecycle === "draft" ||
    lifecycle === "launched" ||
    lifecycle === "vote_live" ||
    lifecycle === "vote_ended" ||
    lifecycle === "finished" ||
    lifecycle === "archived"
  ) {
    return lifecycle;
  }
  return "draft";
}

export function isLegacyLaunchedLifecycle(lifecycle: string): boolean {
  return LEGACY_LAUNCHED_LIFECYCLES.has(lifecycle);
}

export async function patchCampaignLifecycleIfLegacy(
  ctx: MutationCtx,
  doc: Doc<"campaigns">,
): Promise<Doc<"campaigns">> {
  const normalized = normalizeCampaignLifecycle(doc.lifecycle as string);
  if (normalized === doc.lifecycle) {
    return doc;
  }
  await ctx.db.patch(doc._id, { lifecycle: normalized });
  return { ...doc, lifecycle: normalized };
}
