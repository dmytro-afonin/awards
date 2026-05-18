import type { Doc } from "@cvx/_generated/dataModel";

export type CampaignLifecycle = Doc<"campaigns">["lifecycle"];
export type { CampaignVisibility } from "@/lib/campaign-visibility";
export {
  VISIBILITY_DESCRIPTION,
  VISIBILITY_LABELS,
} from "@/lib/campaign-visibility";

export const LIFECYCLE_LABELS: Record<CampaignLifecycle, string> = {
  draft: "Draft",
  launched: "Launched",
  vote_live: "Vote live",
  vote_ended: "Vote ended",
  finished: "Finished",
  archived: "Archived",
};

export const LIFECYCLE_BADGE_CLASS: Record<CampaignLifecycle, string> = {
  draft:
    "border-transparent bg-zinc-500/15 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300",
  launched:
    "border-transparent bg-sky-500/15 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200",
  vote_live:
    "border-transparent bg-amber-500/15 text-amber-900 dark:bg-amber-400/20 dark:text-amber-100",
  vote_ended:
    "border-transparent bg-orange-500/15 text-orange-900 dark:bg-orange-400/20 dark:text-orange-100",
  finished:
    "border-transparent bg-emerald-500/15 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100",
  archived:
    "border-transparent bg-destructive/15 text-destructive dark:bg-destructive/20 dark:text-destructive",
};

export function formatDateRange(
  startsAt?: number,
  endsAt?: number,
): string | null {
  if (!startsAt && !endsAt) return null;
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
  return null;
}

export function workspaceDisplayName(name: string) {
  return name;
}

export const LIFECYCLE_STEPS: CampaignLifecycle[] = [
  "draft",
  "launched",
  "vote_live",
  "vote_ended",
  "finished",
  "archived",
];
