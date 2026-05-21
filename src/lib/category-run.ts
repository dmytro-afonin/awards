import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type CategoryOverview = FunctionReturnType<
  typeof api.campaignCategories.overviewForAdmin
>[number];

export type CategoryRunStatus = CategoryOverview["categoryStatus"];

export function categoryStatusLabel(status: CategoryRunStatus): string {
  switch (status) {
    case "open":
      return "Voting open";
    case "voting_closed":
      return "Voting closed";
    case "finished":
      return "Winner revealed";
  }
}

export const CATEGORY_STATUS_TONE: Record<
  CategoryRunStatus,
  { className: string; dotClassName: string }
> = {
  open: {
    className: "border-sky-500/35 bg-sky-500/10 text-sky-900 dark:text-sky-100",
    dotClassName: "bg-sky-500",
  },
  voting_closed: {
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
    dotClassName: "bg-amber-500",
  },
  finished: {
    className:
      "border-emerald-500/35 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100",
    dotClassName: "bg-emerald-500",
  },
};

/** Full-card surface tint for admin category rows. */
export const CATEGORY_STATUS_SURFACE: Record<CategoryRunStatus, string> = {
  open: "border-sky-500/25 bg-sky-500/[0.04]",
  voting_closed: "border-amber-500/30 bg-amber-500/[0.05]",
  finished: "border-emerald-500/25 bg-emerald-500/[0.04]",
};

/** Stronger fill for the category that needs attention on the runway. */
export const CATEGORY_STATUS_SURFACE_ACTIVE: Record<CategoryRunStatus, string> =
  {
    open: "border-sky-500/50 bg-sky-500/15",
    voting_closed: "border-amber-500/50 bg-amber-500/16",
    finished: "border-emerald-500/50 bg-emerald-500/15",
  };

export function categoryStatusSurface(
  status: CategoryRunStatus,
  options?: { runwayFocus?: boolean },
): string {
  return options?.runwayFocus
    ? CATEGORY_STATUS_SURFACE_ACTIVE[status]
    : CATEGORY_STATUS_SURFACE[status];
}

/** Public story layout — border accents on dark tiles. */
export const CATEGORY_STATUS_PUBLIC_FRAME: Record<CategoryRunStatus, string> = {
  open: "border-zinc-700",
  voting_closed: "border-amber-500/45",
  finished: "border-emerald-500/45",
};

/** Admin can move to the next category only after the winner is public. */
export function canAdvanceFromCategory(status: CategoryRunStatus): boolean {
  return status === "finished";
}

export function canProceedToNextCategory(input: {
  votingOpen: boolean;
  hasVote: boolean;
  categoryStatus?: CategoryRunStatus;
}): boolean {
  if (
    input.categoryStatus === "finished" ||
    input.categoryStatus === "voting_closed"
  ) {
    return true;
  }
  if (!input.votingOpen) {
    return true;
  }
  return input.hasVote;
}

export function countCategoriesByStatus(
  categories: CategoryOverview[],
  status: CategoryRunStatus,
): number {
  return categories.filter((c) => c.categoryStatus === status).length;
}

export function firstCategoryWithStatus(
  categories: CategoryOverview[],
  status: CategoryRunStatus,
): CategoryOverview | undefined {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((c) => c.categoryStatus === status);
}

export function nextCategoryInOrder(
  categories: CategoryOverview[],
  currentId: string,
): CategoryOverview | undefined {
  const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const index = sorted.findIndex((c) => c._id === currentId);
  if (index < 0 || index >= sorted.length - 1) return undefined;
  return sorted[index + 1];
}

export function hasStartedCategoryRunway(
  categories: CategoryOverview[],
): boolean {
  const total = categories.length;
  const open = countCategoriesByStatus(categories, "open");
  return open < total;
}

/** First category on the runway that is not fully done (winner not yet public). */
export function currentRunwayCategory(
  categories: CategoryOverview[],
): CategoryOverview | undefined {
  return [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find((c) => c.categoryStatus !== "finished");
}
