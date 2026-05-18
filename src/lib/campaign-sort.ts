import type { CampaignRow } from "@/components/admin/campaign-row";

export type CampaignSortKey =
  | "name-asc"
  | "name-desc"
  | "status-asc"
  | "status-desc"
  | "relevance-desc"
  | "relevance-asc";

export const DEFAULT_CAMPAIGN_SORT: CampaignSortKey = "name-asc";

export type CampaignSortOption = {
  value: CampaignSortKey;
  /** Chip text, or field name when `direction` is set. */
  label: string;
  direction?: "asc" | "desc";
};

export const CAMPAIGN_SORT_OPTIONS: CampaignSortOption[] = [
  { value: "name-asc", label: "Name", direction: "asc" },
  { value: "name-desc", label: "Name", direction: "desc" },
  { value: "status-asc", label: "Status", direction: "asc" },
  { value: "status-desc", label: "Status", direction: "desc" },
  { value: "relevance-desc", label: "Newest" },
  { value: "relevance-asc", label: "Oldest" },
];

export function campaignSortAriaLabel(option: CampaignSortOption): string {
  if (!option.direction) return option.label;
  return `${option.label}, ${option.direction === "asc" ? "ascending" : "descending"}`;
}

const LIFECYCLE_SORT_ORDER: Record<CampaignRow["lifecycle"], number> = {
  draft: 0,
  launched: 1,
  vote_live: 2,
  vote_ended: 3,
  finished: 4,
  archived: 5,
};

export function sortCampaigns(
  campaigns: CampaignRow[],
  sortKey: CampaignSortKey,
): CampaignRow[] {
  const sorted = [...campaigns];

  switch (sortKey) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "status-asc":
      sorted.sort(
        (a, b) =>
          LIFECYCLE_SORT_ORDER[a.lifecycle] - LIFECYCLE_SORT_ORDER[b.lifecycle],
      );
      break;
    case "status-desc":
      sorted.sort(
        (a, b) =>
          LIFECYCLE_SORT_ORDER[b.lifecycle] - LIFECYCLE_SORT_ORDER[a.lifecycle],
      );
      break;
    case "relevance-desc":
      sorted.sort((a, b) => b._creationTime - a._creationTime);
      break;
    case "relevance-asc":
      sorted.sort((a, b) => a._creationTime - b._creationTime);
      break;
  }

  return sorted;
}
