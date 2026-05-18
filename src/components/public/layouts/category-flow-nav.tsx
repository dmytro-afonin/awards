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
  publicCategoriesPath,
  publicCategoryPath,
} from "@/lib/public-campaign-url";
import type { PublicLayoutId } from "@/lib/public-layout";
import { cn } from "@/lib/utils";

type AdjacentCategory = {
  _id: Id<"campaignCategories">;
  name: string;
  selectedNomineeId: Id<"campaignNominees"> | null;
};

export function CategoryFlowNav({
  slug,
  workspaceId,
  layout,
  index,
  total,
  prev,
  next,
  categoriesHref,
  className,
  nextRequiresVote = true,
  activeSelection,
}: {
  slug: string;
  workspaceId: Id<"workspaces">;
  layout: PublicLayoutId;
  index: number;
  total: number;
  prev: AdjacentCategory | null;
  next: AdjacentCategory | null;
  categoriesHref?: string;
  className?: string;
  nextRequiresVote?: boolean;
  activeSelection: Id<"campaignNominees"> | null;
}) {
  const listHref =
    categoriesHref ?? publicCategoriesPath(slug, workspaceId, layout);
  const canGoNext =
    !nextRequiresVote || activeSelection !== null || next === null;

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
            href={publicCategoryPath(slug, workspaceId, prev._id, layout)}
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
              href={publicCategoryPath(slug, workspaceId, next._id, layout)}
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
              title="Pick a nominee to continue"
            >
              Vote to continue
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
