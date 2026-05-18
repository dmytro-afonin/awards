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
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { CampaignVisibilityIcon } from "@/components/campaign-visibility";
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

        <div className="relative flex flex-col gap-4 p-6 text-white md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CampaignVisibilityIcon
              visibility={campaign.visibility}
              className="text-white/90"
            />
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
          </div>
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
          {footer ? <div className="flex flex-wrap gap-2">{footer}</div> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 bg-card px-4 py-3"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <stat.icon className="size-3.5" />
              {stat.label}
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
