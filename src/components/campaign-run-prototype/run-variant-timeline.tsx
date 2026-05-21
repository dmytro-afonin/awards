"use client";

import { RiArrowRightSLine } from "@remixicon/react";
import { categoryStatusLabel } from "@/components/campaign-run-prototype/campaign-run-mock";
import {
  CampaignRunHeader,
  CampaignRunStateStrip,
  FocusCategoryPanel,
} from "@/components/campaign-run-prototype/campaign-run-shared";
import type { CampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** B — Stage timeline */
export function RunVariantTimeline({ run }: { run: CampaignRunState }) {
  const focus = run.focusCategory;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <CampaignRunHeader run={run} />

      <div className="mt-6 overflow-x-auto pb-2">
        <ol className="flex min-w-max items-center gap-1">
          {run.sorted.map((cat, i) => {
            const isFocus = focus?.id === cat.id;
            const isPast = cat.status === "winner_revealed";
            const isAwaiting = cat.status === "voting_closed";
            return (
              <li key={cat.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => run.selectCategory(cat.id)}
                  className={cn(
                    "flex min-w-[5.5rem] max-w-[7rem] flex-col items-center rounded-lg border px-2 py-2 text-center transition-colors",
                    isFocus && "border-primary bg-primary/10 shadow-sm",
                    !isFocus && "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "mb-1 flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                      isPast &&
                        "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200",
                      isAwaiting &&
                        "bg-amber-500/20 text-amber-900 dark:text-amber-100",
                      !isPast &&
                        !isAwaiting &&
                        "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="line-clamp-2 text-[10px] font-medium leading-tight">
                    {cat.name}
                  </span>
                  <span className="mt-1 text-[9px] uppercase tracking-wide text-muted-foreground">
                    {categoryStatusLabel(cat.status)}
                  </span>
                </button>
                {i < run.sorted.length - 1 ? (
                  <RiArrowRightSLine
                    className="mx-0.5 size-5 shrink-0 text-muted-foreground/50"
                    aria-hidden
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4">
        {focus ? <FocusCategoryPanel run={run} category={focus} /> : null}
      </div>

      {run.closeVoteHead || run.revealHead ? (
        <div className="mt-3 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={run.goToRunwayHead}
          >
            Jump to runway head
          </Button>
        </div>
      ) : null}

      <CampaignRunStateStrip run={run} />
    </div>
  );
}
