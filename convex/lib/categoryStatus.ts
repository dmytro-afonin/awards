import type { Doc } from "../_generated/dataModel";

export type CategoryStatusValue = "open" | "voting_closed" | "finished";

export function normalizeCategoryStatus(
  status: Doc<"campaignCategories">["categoryStatus"],
): CategoryStatusValue {
  if (status === "voting_closed" || status === "finished") {
    return status;
  }
  return "open";
}

export function isCategoryVotingOpen(
  status: Doc<"campaignCategories">["categoryStatus"],
): boolean {
  return normalizeCategoryStatus(status) === "open";
}

export function isCategoryWinnerPublic(
  status: Doc<"campaignCategories">["categoryStatus"],
): boolean {
  return normalizeCategoryStatus(status) === "finished";
}
