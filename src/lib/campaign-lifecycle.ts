import type { CampaignLifecycle } from "@/components/admin/campaign-labels";
import {
  LIFECYCLE_BADGE_CLASS,
  LIFECYCLE_LABELS,
} from "@/components/admin/campaign-labels";

const LEGACY_LAUNCHED_LIFECYCLES = new Set(["started", "live"]);

/** Map legacy DB values and normalize for UI. */
export function normalizeCampaignLifecycle(
  lifecycle: string,
): CampaignLifecycle {
  if (LEGACY_LAUNCHED_LIFECYCLES.has(lifecycle)) {
    return "launched";
  }
  return lifecycle as CampaignLifecycle;
}

export function lifecycleLabel(lifecycle: string): string {
  const normalized = normalizeCampaignLifecycle(lifecycle);
  return LIFECYCLE_LABELS[normalized] ?? lifecycle;
}

export function lifecycleBadgeClass(lifecycle: string): string {
  const normalized = normalizeCampaignLifecycle(lifecycle);
  return (
    LIFECYCLE_BADGE_CLASS[normalized] ??
    "border-transparent bg-muted text-muted-foreground"
  );
}

export function canLaunchCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "ready";
}

export function canFinishCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "launched";
}

export function canDeleteCampaign(lifecycle: string): boolean {
  const state = normalizeCampaignLifecycle(lifecycle);
  return state === "draft" || state === "ready";
}

export function canArchiveCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "finished";
}

export function canEditCampaignLifecycle(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "draft";
}

/** Pencil Edit in list/card row actions (ready only; draft uses lifecycle Edit). */
export function canShowRowEditLink(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "ready";
}

export function canShowRowDelete(lifecycle: string): boolean {
  return canDeleteCampaign(lifecycle);
}
