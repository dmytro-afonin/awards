import type { Doc } from "@cvx/_generated/dataModel";

export type CampaignLifecycle = Doc<"campaigns">["lifecycle"];
export type CampaignVisibility = Doc<"campaigns">["visibility"];

export const LIFECYCLE_LABELS: Record<CampaignLifecycle, string> = {
  draft: "Draft",
  ready: "Ready",
  started: "Started",
  finished: "Finished",
};

export const VISIBILITY_LABELS: Record<CampaignVisibility, string> = {
  public: "Public",
  private: "Private",
};

export function formatDateRange(startsAt?: number, endsAt?: number): string {
  if (!startsAt && !endsAt) return "No dates set";
  const fmt = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (startsAt && endsAt) {
    return `${fmt.format(startsAt)} – ${fmt.format(endsAt)}`;
  }
  if (startsAt) return `From ${fmt.format(startsAt)}`;
  if (endsAt) return `Until ${fmt.format(endsAt)}`;
  return "No dates set";
}

export function workspaceDisplayName(name: string, isDefault: boolean) {
  return isDefault ? `${name} (default)` : name;
}
