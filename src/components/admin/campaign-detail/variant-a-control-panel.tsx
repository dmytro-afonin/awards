"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiGlobalLine, RiLockLine, RiPencilLine } from "@remixicon/react";
import Link from "next/link";
import { CampaignTitleBlock } from "@/components/admin/campaign-detail/campaign-title-block";
import {
  LifecycleStepper,
  mapToProposedLifecycle,
  PrototypeLifecycleActions,
} from "@/components/admin/campaign-detail/lifecycle-prototype";
import {
  CategoriesOverviewList,
  ReadinessChecklist,
  StatTile,
} from "@/components/admin/campaign-detail/shared-parts";
import { useCampaignDetailData } from "@/components/admin/campaign-detail/use-campaign-detail-data";
import { PreviewPageHeader } from "@/components/admin/campaign-detail/variant-switcher";
import { formatDateRange } from "@/components/admin/campaign-labels";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CAMPAIGN_VISIBILITY } from "@/lib/campaign-visibility";
import { formatVoteCount, formatVotePercent } from "@/lib/campaign-vote-stats";
import { publicCampaignPath } from "@/lib/public-campaign-url";

export function CampaignDetailVariantA({
  campaignId,
}: {
  campaignId: Id<"campaigns">;
}) {
  const { campaign, categories, readiness, isLoading } =
    useCampaignDetailData(campaignId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign || !categories || !readiness) {
    return (
      <div className="p-4 md:p-6 text-sm text-muted-foreground">
        Campaign not found.
      </div>
    );
  }

  const proposed = mapToProposedLifecycle(campaign.lifecycle);
  const visibility = CAMPAIGN_VISIBILITY[campaign.visibility];
  const VisibilityIcon =
    campaign.visibility === "public" ? RiGlobalLine : RiLockLine;
  const dates = formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <PreviewPageHeader
        campaignId={campaignId}
        active="a"
        title="Control panel layout"
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Sidebar control room */}
        <aside className="w-full shrink-0 rounded-xl border border-zinc-800/10 bg-zinc-950/[0.03] p-4 dark:border-zinc-100/10 dark:bg-zinc-50/[0.03] lg:sticky lg:top-4 lg:w-72">
          <div className="mb-4 flex items-center justify-between gap-2">
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Console
            </span>
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lifecycle pipeline
          </p>
          <LifecycleStepper active={proposed} orientation="vertical" />

          <Separator className="my-4" />

          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Actions
          </p>
          <PrototypeLifecycleActions campaign={campaign} layout="sidebar" />

          <Separator className="my-4" />

          <div className="flex items-start gap-2 rounded-lg bg-background/80 p-3 ring-1 ring-border">
            <div
              className={`flex size-8 items-center justify-center rounded-md ${visibility.surfaceClassName}`}
            >
              <VisibilityIcon
                className={`size-4 ${visibility.iconClassName}`}
              />
            </div>
            <div>
              <p className="text-sm font-medium">{visibility.label}</p>
              <p className="text-xs text-muted-foreground">
                {visibility.description}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-1">
            <Link
              href={`/admin/campaigns/${campaignId}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <RiPencilLine className="size-4" />
              Edit metadata
            </Link>
            <Link
              href={publicCampaignPath(campaign.slug, campaign.workspaceId)}
              className={buttonVariants({ variant: "ghost", size: "sm" })}
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
            >
              View public page
            </Link>
          </div>
        </aside>

        {/* Main workspace */}
        <main className="min-w-0 flex-1 space-y-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {campaign.imageUrl ? (
              <div
                className="h-28 w-full shrink-0 rounded-lg bg-cover bg-center ring-1 ring-border sm:h-24 sm:w-40"
                style={{ backgroundImage: `url(${campaign.imageUrl})` }}
                role="img"
                aria-hidden
              />
            ) : null}
            <CampaignTitleBlock
              name={campaign.name}
              slug={campaign.slug}
              description={campaign.description}
              dates={dates}
              size="md"
              className="min-w-0 flex-1"
            />
          </header>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Categories"
              value={String(campaign.categoryCount)}
            />
            <StatTile
              label="Nominees"
              value={String(campaign.nomineeCount)}
              accent="sky"
            />
            <StatTile
              label="Votes"
              value={formatVoteCount(campaign.voteCount)}
              hint={formatVotePercent(campaign.votePercent)}
              accent="amber"
            />
            <StatTile
              label="Members"
              value={String(campaign.memberCount)}
              accent="violet"
            />
          </div>

          <section>
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">Categories & nominees</h2>
              <span className="text-xs text-muted-foreground">
                Read-only overview
              </span>
            </div>
            <CategoriesOverviewList
              categories={categories}
              nomineeLayout="scroll"
              campaignLifecycle={campaign.lifecycle}
            />
          </section>

          {!readiness.canLaunch && proposed === "draft" ? (
            <section className="rounded-xl border border-dashed border-border p-4">
              <h2 className="mb-3 text-sm font-medium">Launch checklist</h2>
              <ReadinessChecklist
                canLaunch={readiness.canLaunch}
                categoryCount={readiness.categoryCount}
                categories={readiness.categories}
              />
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
