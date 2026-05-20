"use client";

import {
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiNodeTree,
  RiTeamLine,
} from "@remixicon/react";
import type { ReactNode } from "react";
import { CampaignTitleBlock } from "@/components/admin/campaign-detail/campaign-title-block";
import { LifecycleStepper } from "@/components/admin/campaign-detail/lifecycle-stepper";
import { CampaignVisibilityIcon } from "@/components/campaign-visibility";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CampaignVisibility } from "@/lib/campaign-visibility";
import {
  formatMemberCount,
  formatVoteCount,
  formatVotePercent,
} from "@/lib/campaign-vote-stats";
import { cn } from "@/lib/utils";

export type CampaignDetailHeroCampaign = {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  visibility: CampaignVisibility;
  lifecycle: string;
  categoryCount: number;
  nomineeCount: number;
  memberCount: number;
  voteCount: number;
  votePercent: number;
};

type CampaignDetailHeroProps = {
  campaign: CampaignDetailHeroCampaign;
  dates?: string | null;
  /** Optional row below title (e.g. lifecycle action buttons in previews) */
  footer?: ReactNode;
  className?: string;
};

export function CampaignDetailHero({
  campaign,
  dates,
  footer,
  className,
}: CampaignDetailHeroProps) {
  const stats = [
    {
      icon: RiNodeTree,
      label: "Categories",
      value: String(campaign.categoryCount),
    },
    {
      icon: RiTeamLine,
      label: "Nominees",
      value: String(campaign.nomineeCount),
    },
    {
      icon: RiGroupLine,
      label: "Members",
      value: formatMemberCount(campaign.memberCount),
    },
    {
      icon: RiCheckboxCircleLine,
      label: "Participation",
      value: `${formatVoteCount(campaign.voteCount)} (${formatVotePercent(campaign.votePercent)})`,
    },
  ] as const;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl ring-1 ring-border",
        className,
      )}
    >
      <div
        className={cn(
          "relative min-h-[220px] bg-gradient-to-br from-sky-600 via-indigo-700 to-violet-900",
          campaign.imageUrl && "bg-none",
        )}
      >
        {campaign.imageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${campaign.imageUrl})` }}
              role="img"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 left-10 size-48 rounded-full bg-sky-300/20 blur-2xl" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 border-b border-white/10 bg-black/15 px-4 py-3 backdrop-blur-sm md:px-6">
          <LifecycleStepper
            lifecycle={campaign.lifecycle}
            orientation="horizontal"
            variant="hero-overlay"
          />
        </div>

        <div className="relative flex flex-col gap-4 p-6 pt-20 text-white md:p-8 md:pt-24">
          <div className="flex items-start gap-3">
            <CampaignVisibilityIcon
              visibility={campaign.visibility}
              size="md"
              className="mt-0.5 shrink-0 rounded-md bg-white/15 p-1.5 ring-1 ring-white/25 backdrop-blur-sm"
              iconClassName="text-white"
            />
            <CampaignTitleBlock
              name={campaign.name}
              slug={campaign.slug}
              description={campaign.description}
              dates={
                dates ? (
                  <span className="inline-flex items-center gap-1.5">
                    <RiCalendarLine className="size-4 shrink-0" aria-hidden />
                    {dates}
                  </span>
                ) : null
              }
              size="hero"
              inverted
            />
          </div>
          {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
        </div>
      </div>

      <div className="flex overflow-x-auto bg-border">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex min-w-0 flex-1 items-center bg-card px-2 py-2 xl:px-4 xl:py-2.5",
              index > 0 && "border-l border-border",
            )}
          >
            <Tooltip>
              <TooltipTrigger className="flex min-w-0 flex-1 items-center justify-center gap-1.5 outline-none xl:justify-start xl:gap-2">
                <stat.icon
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="hidden truncate text-xs text-muted-foreground xl:inline">
                  {stat.label}
                </span>
                <span className="max-w-[5.5rem] shrink-0 truncate text-sm font-semibold tabular-nums xl:ml-auto xl:max-w-none">
                  {stat.value}
                </span>
                <span className="sr-only xl:hidden">
                  {stat.label}: {stat.value}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="xl:hidden">
                {stat.label}
              </TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </section>
  );
}
