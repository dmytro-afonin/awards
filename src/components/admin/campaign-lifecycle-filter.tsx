"use client";

import { RiArrowDownSLine, RiFilter3Line } from "@remixicon/react";
import {
  type CampaignLifecycle,
  LIFECYCLE_BADGE_CLASS,
  LIFECYCLE_LABELS,
} from "@/components/admin/campaign-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CAMPAIGN_LIFECYCLE_FILTER_OPTIONS,
  DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS,
} from "@/lib/campaign-lifecycle-filters";
import { cn } from "@/lib/utils";

const STATUS_COUNT = CAMPAIGN_LIFECYCLE_FILTER_OPTIONS.length;

type CampaignLifecycleFilterProps = {
  selected: CampaignLifecycle[];
  onChange: (next: CampaignLifecycle[]) => void;
  className?: string;
};

export function CampaignLifecycleFilter({
  selected,
  onChange,
  className,
}: CampaignLifecycleFilterProps) {
  const selectedSet = new Set(selected);

  const toggle = (lifecycle: CampaignLifecycle) => {
    if (selectedSet.has(lifecycle)) {
      onChange(selected.filter((s) => s !== lifecycle));
    } else {
      onChange([...selected, lifecycle]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9 shrink-0 gap-1.5 tabular-nums", className)}
            aria-label={`${selected.length} of ${STATUS_COUNT} statuses selected`}
          />
        }
      >
        <RiFilter3Line className="size-4 opacity-60" aria-hidden />
        <span>
          {selected.length}/{STATUS_COUNT}
        </span>
        <RiArrowDownSLine className="size-4 opacity-60" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Statuses</DropdownMenuLabel>
          {CAMPAIGN_LIFECYCLE_FILTER_OPTIONS.map((lifecycle) => (
            <DropdownMenuCheckboxItem
              key={lifecycle}
              checked={selectedSet.has(lifecycle)}
              onCheckedChange={() => toggle(lifecycle)}
              onSelect={(event) => event.preventDefault()}
              className="gap-2"
            >
              <span
                className={cn(
                  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium",
                  LIFECYCLE_BADGE_CLASS[lifecycle],
                )}
              >
                {LIFECYCLE_LABELS[lifecycle]}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onChange([...CAMPAIGN_LIFECYCLE_FILTER_OPTIONS])}
          >
            Select all
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onChange([...DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS])}
          >
            Reset to default
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
