import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const LEGACY_LAUNCHED_LIFECYCLES = new Set(["started", "live"]);

export type CampaignLifecycle = Doc<"campaigns">["lifecycle"];

export function normalizeCampaignLifecycle(
  lifecycle: string,
): CampaignLifecycle {
  if (LEGACY_LAUNCHED_LIFECYCLES.has(lifecycle)) {
    return "launched";
  }
  if (
    lifecycle === "draft" ||
    lifecycle === "ready" ||
    lifecycle === "launched" ||
    lifecycle === "finished" ||
    lifecycle === "deleted"
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
