"use client";

import type { Id } from "@cvx/_generated/dataModel";
import Link from "next/link";
import { CampaignDetailHero } from "@/components/admin/campaign-detail/campaign-detail-hero";
import { PrototypeLifecycleActions } from "@/components/admin/campaign-detail/lifecycle-prototype";
import {
  CategoriesOverviewList,
  ReadinessChecklist,
  StatTile,
} from "@/components/admin/campaign-detail/shared-parts";
import { useCampaignDetailData } from "@/components/admin/campaign-detail/use-campaign-detail-data";
import { PreviewPageHeader } from "@/components/admin/campaign-detail/variant-switcher";
import { formatDateRange } from "@/components/admin/campaign-labels";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatVotePercent } from "@/lib/campaign-vote-stats";

export function CampaignDetailVariantB({
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
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-64 w-full" />
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

  const dates = formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
      <PreviewPageHeader
        campaignId={campaignId}
        active="b"
        title="Hero dashboard layout"
      />

      <CampaignDetailHero
        campaign={campaign}
        dates={dates}
        footer={<PrototypeLifecycleActions campaign={campaign} layout="hero" />}
      />

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 text-lg font-semibold">Nominee lineup</h2>
          <CategoriesOverviewList
            categories={categories}
            nomineeLayout="grid"
            campaignLifecycle={campaign.lifecycle}
          />
        </section>

        <aside className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-card p-5">
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Next step
            </h2>
            <p className="mb-4 text-sm">
              {readiness.canLaunch
                ? "Setup complete — you can launch when ready."
                : "Finish categories and nominees before going live."}
            </p>
            <ReadinessChecklist
              canLaunch={readiness.canLaunch}
              categoryCount={readiness.categoryCount}
              categories={readiness.categories}
              campaignId={campaignId}
              campaignName={campaign.name}
              lifecycle={campaign.lifecycle}
            />
          </div>

          <StatTile
            label="Vote rate"
            value={formatVotePercent(campaign.votePercent)}
            accent="emerald"
          />

          <Link
            href={`/admin/campaigns/${campaignId}`}
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Edit campaign details
          </Link>
        </aside>
      </div>
    </div>
  );
}
