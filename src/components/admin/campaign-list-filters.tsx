"use client";

import { RiFilter3Line, RiSortAsc, RiSortDesc } from "@remixicon/react";
import {
  type CampaignLifecycle,
  LIFECYCLE_BADGE_CLASS,
  LIFECYCLE_LABELS,
} from "@/components/admin/campaign-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CAMPAIGN_LIFECYCLE_FILTER_OPTIONS,
  DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS,
  isDefaultLifecycleFilters,
} from "@/lib/campaign-lifecycle-filters";
import {
  CAMPAIGN_SORT_OPTIONS,
  type CampaignSortKey,
  campaignSortAriaLabel,
  DEFAULT_CAMPAIGN_SORT,
} from "@/lib/campaign-sort";
import { cn } from "@/lib/utils";

type CampaignListFiltersProps = {
  lifecycleFilters: CampaignLifecycle[];
  onLifecycleFiltersChange: (next: CampaignLifecycle[]) => void;
  sort: CampaignSortKey;
  onSortChange: (sort: CampaignSortKey) => void;
  className?: string;
};

export function CampaignListFilters({
  lifecycleFilters,
  onLifecycleFiltersChange,
  sort,
  onSortChange,
  className,
}: CampaignListFiltersProps) {
  const selectedSet = new Set(lifecycleFilters);
  const showActiveIndicator =
    sort !== DEFAULT_CAMPAIGN_SORT ||
    !isDefaultLifecycleFilters(lifecycleFilters);

  const toggleLifecycle = (lifecycle: CampaignLifecycle) => {
    if (selectedSet.has(lifecycle)) {
      onLifecycleFiltersChange(lifecycleFilters.filter((s) => s !== lifecycle));
    } else {
      onLifecycleFiltersChange([...lifecycleFilters, lifecycle]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className={cn("relative size-9 shrink-0", className)}
            aria-label="Filter and sort campaigns"
          />
        }
      >
        <RiFilter3Line className="size-4" />
        {showActiveIndicator ? (
          <span
            className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary"
            aria-hidden
          />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() =>
                    onLifecycleFiltersChange([
                      ...CAMPAIGN_LIFECYCLE_FILTER_OPTIONS,
                    ])
                  }
                >
                  All
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() =>
                    onLifecycleFiltersChange([
                      ...DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS,
                    ])
                  }
                >
                  Default
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CAMPAIGN_LIFECYCLE_FILTER_OPTIONS.map((lifecycle) => {
                const selected = selectedSet.has(lifecycle);
                return (
                  <button
                    key={lifecycle}
                    type="button"
                    aria-pressed={selected}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => toggleLifecycle(lifecycle)}
                    className={cn(
                      "inline-flex cursor-pointer items-center rounded-sm border px-2 py-1 text-xs font-medium transition-colors",
                      selected
                        ? cn(
                            LIFECYCLE_BADGE_CLASS[lifecycle],
                            "border-transparent ring-2 ring-ring ring-offset-1 ring-offset-popover",
                          )
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {LIFECYCLE_LABELS[lifecycle]}
                  </button>
                );
              })}
            </div>
          </section>

          <hr className="border-border" />

          <section className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Sort by
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CAMPAIGN_SORT_OPTIONS.map((option) => {
                const selected = sort === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={selected}
                    aria-label={campaignSortAriaLabel(option)}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => onSortChange(option.value)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2 py-1 text-xs font-medium transition-colors",
                      selected
                        ? "border-transparent bg-primary text-primary-foreground ring-2 ring-ring ring-offset-1 ring-offset-popover"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {option.direction ? (
                      <>
                        <span>{option.label}</span>
                        {option.direction === "asc" ? (
                          <RiSortAsc className="size-4 shrink-0" aria-hidden />
                        ) : (
                          <RiSortDesc className="size-4 shrink-0" aria-hidden />
                        )}
                      </>
                    ) : (
                      option.label
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
