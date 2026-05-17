import type { CampaignLifecycle } from "@/components/admin/campaign-labels";

export const CAMPAIGN_LIFECYCLE_FILTER_OPTIONS: CampaignLifecycle[] = [
  "draft",
  "ready",
  "launched",
  "finished",
  "deleted",
];

/** Default list view: all active statuses, hide deleted. */
export const DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS: CampaignLifecycle[] = [
  "draft",
  "ready",
  "launched",
  "finished",
];

export function isDefaultLifecycleFilters(
  filters: CampaignLifecycle[],
): boolean {
  if (filters.length !== DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS.length) {
    return false;
  }
  const set = new Set(filters);
  return DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS.every((s) => set.has(s));
}
