"use client";

import {
  type RemixiconComponentType,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiGroupLine,
  RiNodeTree,
  RiTeamLine,
} from "@remixicon/react";
import type { ReactNode } from "react";
import { formatDateRange } from "@/components/admin/campaign-labels";
import type { CampaignRow } from "@/components/admin/campaign-row";
import {
  formatMemberCount,
  formatVoteCount,
  formatVotePercent,
} from "@/lib/campaign-vote-stats";
import { cn } from "@/lib/utils";

function StatSeparator() {
  return (
    <span className="text-border" aria-hidden>
      ·
    </span>
  );
}

function StatItem({
  icon: Icon,
  children,
}: {
  icon: RemixiconComponentType;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3.5 shrink-0 opacity-80" aria-hidden />
      <span>{children}</span>
    </span>
  );
}

type CampaignStatsProps = {
  campaign: CampaignRow;
  className?: string;
};

export function CampaignStats({ campaign, className }: CampaignStatsProps) {
  const dates = formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground",
        className,
      )}
    >
      {dates ? (
        <>
          <StatItem icon={RiCalendarLine}>{dates}</StatItem>
          <StatSeparator />
        </>
      ) : null}
      <StatItem icon={RiNodeTree}>
        {campaign.categoryCount}{" "}
        {campaign.categoryCount === 1 ? "category" : "categories"}
      </StatItem>
      <StatSeparator />
      <StatItem icon={RiTeamLine}>
        {campaign.nomineeCount}{" "}
        {campaign.nomineeCount === 1 ? "nominee" : "nominees"}
      </StatItem>
      <StatSeparator />
      <StatItem icon={RiGroupLine}>
        {formatMemberCount(campaign.memberCount)}
      </StatItem>
      <StatSeparator />
      <StatItem icon={RiCheckboxCircleLine}>
        {formatVoteCount(campaign.voteCount)} (
        {formatVotePercent(campaign.votePercent)})
      </StatItem>
    </div>
  );
}
