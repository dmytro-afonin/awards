"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiGlobalLine, RiLockLine, RiPencilLine } from "@remixicon/react";
import Link from "next/link";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignDetailHero } from "@/components/admin/campaign-detail/campaign-detail-hero";
import { CampaignLifecyclePanel } from "@/components/admin/campaign-detail/campaign-lifecycle-panel";
import { LifecycleStepper } from "@/components/admin/campaign-detail/lifecycle-stepper";
import {
  CategoriesOverviewList,
  ReadinessChecklist,
} from "@/components/admin/campaign-detail/shared-parts";
import { useCampaignDetailData } from "@/components/admin/campaign-detail/use-campaign-detail-data";
import { formatDateRange } from "@/components/admin/campaign-labels";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeCampaignLifecycle } from "@/lib/campaign-lifecycle";
import { CAMPAIGN_VISIBILITY } from "@/lib/campaign-visibility";
import { publicCampaignPath } from "@/lib/public-campaign-url";

export function CampaignDetailView({
  campaignId,
}: {
  campaignId: Id<"campaigns">;
}) {
  const { workspaceId, setSelectedCampaignId } = useAdmin();
  const { campaign, categories, readiness, isLoading } =
    useCampaignDetailData(campaignId);

  useEffect(() => {
    setSelectedCampaignId(campaignId);
  }, [campaignId, setSelectedCampaignId]);

  if (!workspaceId) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No workspace</EmptyTitle>
            <EmptyDescription>
              Select a workspace in the sidebar to view campaigns.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign || !categories || !readiness) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>Campaign not found</EmptyTitle>
            <EmptyDescription>
              This campaign could not be found, or you do not have admin access.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const state = normalizeCampaignLifecycle(campaign.lifecycle);
  const visibility = CAMPAIGN_VISIBILITY[campaign.visibility];
  const VisibilityIcon =
    campaign.visibility === "public" ? RiGlobalLine : RiLockLine;
  const dates = formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
      <CampaignDetailHero campaign={campaign} dates={dates} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="w-full shrink-0 rounded-xl border border-zinc-800/10 bg-zinc-950/[0.03] p-4 dark:border-zinc-100/10 dark:bg-zinc-50/[0.03] lg:sticky lg:top-4 lg:w-72">
          <div className="mb-4 flex items-center justify-between gap-2">
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Console
            </span>
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lifecycle
          </p>
          <LifecycleStepper lifecycle={campaign.lifecycle} />

          <Separator className="my-4" />

          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Actions
          </p>
          <CampaignLifecyclePanel
            campaignId={campaignId}
            campaignName={campaign.name}
            slug={campaign.slug}
            workspaceId={campaign.workspaceId}
            lifecycle={campaign.lifecycle}
            canLaunch={readiness.canLaunch}
          />

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
              href={`/admin/campaigns/${campaignId}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <RiPencilLine className="size-4" />
              Edit metadata
            </Link>
            <Link
              href={`/admin/campaigns/${campaignId}/content`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Edit categories & nominees
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

        <main className="min-w-0 flex-1 space-y-5">
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

          {state === "draft" && !readiness.canLaunch ? (
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
