"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiArrowRightLine } from "@remixicon/react";
import { useEffect, useMemo, useState } from "react";
import { CategoryBallotControls } from "@/components/admin/campaign-detail/category-ballot-controls";
import { CategoryStatusIndicator } from "@/components/admin/campaign-detail/category-status-indicator";
import {
  type CategoryOverview,
  NomineesGallery,
} from "@/components/admin/campaign-detail/shared-parts";
import { WinnerRevealCelebration } from "@/components/admin/campaign-detail/winner-reveal-celebration";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_STATUS_TONE,
  canAdvanceFromCategory,
  categoryStatusSurface,
  currentRunwayCategory,
  firstCategoryWithStatus,
  nextCategoryInOrder,
  type CategoryOverview as RunCategory,
} from "@/lib/category-run";
import { cn } from "@/lib/utils";

function defaultFocusCategory(
  categories: RunCategory[],
): RunCategory | undefined {
  return (
    firstCategoryWithStatus(categories, "open") ??
    firstCategoryWithStatus(categories, "voting_closed") ??
    categories[0]
  );
}

export function CampaignRunLead({
  categories,
}: {
  categories: CategoryOverview[];
}) {
  const [focusId, setFocusId] = useState<Id<"campaignCategories"> | null>(null);
  const [celebrateReveal, setCelebrateReveal] = useState(false);

  const closeHead = firstCategoryWithStatus(categories, "open");
  const revealHead = firstCategoryWithStatus(categories, "voting_closed");

  const focus = useMemo(() => {
    if (focusId) {
      return (
        categories.find((c) => c._id === focusId) ??
        defaultFocusCategory(categories)
      );
    }
    return defaultFocusCategory(categories);
  }, [categories, focusId]);

  const focusCategoryStatus = focus?.categoryStatus;

  useEffect(() => {
    setCelebrateReveal(false);
  }, [focusId, focusCategoryStatus]);

  const nextCategory = focus
    ? nextCategoryInOrder(categories, focus._id)
    : undefined;
  const showNext =
    focus !== undefined &&
    nextCategory !== undefined &&
    canAdvanceFromCategory(focus.categoryStatus);

  const winner =
    focus?.categoryStatus === "finished" && focus.winnerNomineeId
      ? focus.nominees.find((n) => n._id === focus.winnerNomineeId)
      : undefined;

  const focusIndex = focus
    ? categories.findIndex((c) => c._id === focus._id) + 1
    : 0;

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories yet. Add categories while the campaign is in draft.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Run of show
          </p>
          {currentRunwayCategory(categories) ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const head = currentRunwayCategory(categories);
                if (head) setFocusId(head._id);
              }}
            >
              Jump to runway head
            </Button>
          ) : null}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat, i) => {
            const isFocus = focus?._id === cat._id;
            const isCloseHead = closeHead?._id === cat._id;
            const isRevealHead = revealHead?._id === cat._id;
            const tone = CATEGORY_STATUS_TONE[cat.categoryStatus];

            return (
              <button
                key={cat._id}
                type="button"
                onClick={() => setFocusId(cat._id)}
                className={cn(
                  "flex min-w-[9rem] shrink-0 flex-col gap-1 rounded-xl border px-3 py-2 text-left transition-colors",
                  categoryStatusSurface(cat.categoryStatus, {
                    runwayFocus: isFocus,
                  }),
                  !isFocus && "opacity-95 hover:opacity-100",
                )}
              >
                <span className="flex items-center gap-1.5 text-[10px] tabular-nums text-muted-foreground">
                  <span
                    className={cn("size-1.5 rounded-full", tone.dotClassName)}
                    aria-hidden
                  />
                  {i + 1} ·{" "}
                  {isCloseHead
                    ? "Close next"
                    : isRevealHead
                      ? "Reveal next"
                      : "Category"}
                </span>
                <span className="truncate text-sm font-medium">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {focus ? (
        <section
          className={cn(
            "rounded-xl border p-4 shadow-sm md:p-5",
            categoryStatusSurface(focus.categoryStatus, { runwayFocus: true }),
          )}
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs tabular-nums text-muted-foreground">
                Category {focusIndex} of {categories.length}
              </p>
              <h2 className="text-xl font-semibold">{focus.name}</h2>
            </div>
            <CategoryStatusIndicator status={focus.categoryStatus} />
          </div>

          {celebrateReveal && winner ? (
            <WinnerRevealCelebration
              winnerName={winner.name}
              voteCount={winner.voteCount}
              className="mb-4"
            />
          ) : null}

          <NomineesGallery
            nominees={focus.nominees}
            layout="scroll"
            showWinners={focus.categoryStatus === "finished"}
            showVoteCounts={focus.categoryStatus === "finished"}
            showPublicLinks={false}
            winnerId={focus.winnerNomineeId}
          />

          <CategoryBallotControls
            category={focus}
            categories={categories}
            labelMode="always"
            onRevealSuccess={() => setCelebrateReveal(true)}
          />

          {showNext ? (
            <div className="mt-4 border-t border-border pt-4">
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => {
                  setCelebrateReveal(false);
                  setFocusId(nextCategory._id);
                }}
              >
                Next category
                <RiArrowRightLine />
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Up next: {nextCategory.name}
              </p>
            </div>
          ) : null}
        </section>
      ) : (
        <p className="text-sm text-muted-foreground">
          Run complete — all winners are public.
        </p>
      )}
    </div>
  );
}
