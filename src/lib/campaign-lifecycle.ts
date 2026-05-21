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
  if (lifecycle === "ready") {
    return "draft";
  }
  if (lifecycle === "deleted") {
    return "archived";
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

export function canLaunchFromDraft(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "draft";
}

export function canGoLiveAndVote(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "draft";
}

export function canOpenVoting(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "launched";
}

export function canCloseVoting(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "vote_live";
}

export function canFinishCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "vote_ended";
}

export function canDeleteCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "draft";
}

export function canArchiveCampaign(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) === "finished";
}

export function canEditCampaignMetadata(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) !== "archived";
}

/** Campaign is past draft — edits may affect voters and public links. */
export function isLiveCampaignLifecycle(lifecycle: string): boolean {
  const state = normalizeCampaignLifecycle(lifecycle);
  return (
    state === "launched" ||
    state === "vote_live" ||
    state === "vote_ended" ||
    state === "finished"
  );
}

export function canManageCampaignContent(lifecycle: string): boolean {
  return normalizeCampaignLifecycle(lifecycle) !== "archived";
}

export function canViewPublicCampaign(lifecycle: string): boolean {
  const state = normalizeCampaignLifecycle(lifecycle);
  return (
    state === "launched" ||
    state === "vote_live" ||
    state === "vote_ended" ||
    state === "finished"
  );
}

/** @deprecated */
export function canLaunchCampaign(lifecycle: string): boolean {
  return canLaunchFromDraft(lifecycle);
}

/** @deprecated */
export function canEditCampaignLifecycle(lifecycle: string): boolean {
  return canEditCampaignMetadata(lifecycle);
}

/** @deprecated */
export function canShowRowEditLink(_lifecycle: string): boolean {
  return false;
}

export function canShowRowDelete(lifecycle: string): boolean {
  return canDeleteCampaign(lifecycle);
}
