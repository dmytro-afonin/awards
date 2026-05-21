"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignDetailHero } from "@/components/admin/campaign-detail/campaign-detail-hero";
import { CampaignManagementBar } from "@/components/admin/campaign-detail/campaign-management-bar";
import {
  CategoriesOverviewList,
  ReadinessChecklist,
} from "@/components/admin/campaign-detail/shared-parts";
import { useCampaignDetailData } from "@/components/admin/campaign-detail/use-campaign-detail-data";
import { formatDateRange } from "@/components/admin/campaign-labels";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canViewPublicCampaign,
  normalizeCampaignLifecycle,
} from "@/lib/campaign-lifecycle";

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
  const dates = formatDateRange(campaign.votingStartsAt, campaign.votingEndsAt);
  const showRunTools = state === "vote_live" || state === "vote_ended";
  const showPublicLinks = canViewPublicCampaign(campaign.lifecycle);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
      <CampaignDetailHero campaign={campaign} dates={dates} />

      <CampaignManagementBar
        campaignId={campaignId}
        campaignName={campaign.name}
        slug={campaign.slug}
        workspaceId={campaign.workspaceId}
        lifecycle={campaign.lifecycle}
        canLaunch={readiness.canLaunch}
        categories={categories}
        showRunTools={showRunTools}
      />

      <main className="min-w-0 space-y-5">
        <section>
          <h2 className="mb-3 text-lg font-medium">Categories & nominees</h2>

          <CategoriesOverviewList
            categories={categories}
            nomineeLayout="scroll"
            campaignLifecycle={campaign.lifecycle}
            slug={campaign.slug}
            workspaceId={campaign.workspaceId}
            showPublicLinks={showPublicLinks}
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
  );
}
