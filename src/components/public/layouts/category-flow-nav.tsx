"use client";

import type { Id } from "@cvx/_generated/dataModel";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
} from "@remixicon/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  type CategoryRunStatus,
  canProceedToNextCategory,
} from "@/lib/category-run";
import {
  publicCategoriesPath,
  publicCategoryPath,
} from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

type AdjacentCategory = {
  _id: Id<"campaignCategories">;
  name: string;
  slug: string;
  selectedNomineeId: Id<"campaignNominees"> | null;
};

export function CategoryFlowNav({
  slug,
  workspaceId,
  index,
  total,
  prev,
  next,
  categoriesHref,
  className,
  activeSelection,
  votingOpen = true,
  categoryStatus,
}: {
  slug: string;
  workspaceId: Id<"workspaces">;
  index: number;
  total: number;
  prev: AdjacentCategory | null;
  next: AdjacentCategory | null;
  categoriesHref?: string;
  className?: string;
  activeSelection: Id<"campaignNominees"> | null;
  votingOpen?: boolean;
  categoryStatus?: CategoryRunStatus;
}) {
  const listHref = categoriesHref ?? publicCategoriesPath(slug, workspaceId);
  const canGoNext =
    next === null ||
    canProceedToNextCategory({
      votingOpen,
      hasVote: activeSelection !== null,
      categoryStatus,
    });

  return (
    <nav
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
      aria-label="Category navigation"
    >
      <div className="flex flex-wrap items-center gap-2">
        {prev ? (
          <Link
            href={publicCategoryPath(slug, workspaceId, prev.slug)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <RiArrowLeftLine className="size-4" aria-hidden />
            {prev.name}
          </Link>
        ) : (
          <Link
            href={listHref}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <RiArrowLeftLine className="size-4" aria-hidden />
            All categories
          </Link>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {index >= 0 ? index + 1 : "—"} / {total}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <Link
          href={listHref}
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Category list
        </Link>
        {next ? (
          canGoNext ? (
            <Link
              href={publicCategoryPath(slug, workspaceId, next.slug)}
              className={buttonVariants({ size: "sm" })}
            >
              Next: {next.name}
              <RiArrowRightLine className="size-4" aria-hidden />
            </Link>
          ) : (
            <span
              className={cn(
                buttonVariants({ size: "sm" }),
                "pointer-events-none opacity-50",
              )}
              title={
                votingOpen
                  ? "Pick a nominee to continue"
                  : "Complete this step to continue"
              }
            >
              {votingOpen ? "Vote to continue" : "Continue"}
              <RiArrowRightLine className="size-4" aria-hidden />
            </span>
          )
        ) : activeSelection ? (
          <Link
            href={listHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "gap-1 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600",
            )}
          >
            <RiCheckLine className="size-4" aria-hidden />
            Done — back to list
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
