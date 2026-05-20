"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiArrowLeftLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignCategoriesEditor } from "@/components/admin/campaign-categories-editor";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canManageCampaignContent,
  isLiveCampaignLifecycle,
  lifecycleLabel,
  normalizeCampaignLifecycle,
} from "@/lib/campaign-lifecycle";

export default function AdminCampaignContentPage() {
  const params = useParams();
  const raw = params.campaignId;
  const campaignId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const { workspaceId, setSelectedCampaignId } = useAdmin();

  const campaign = useQuery(
    api.campaigns.getForAdmin,
    campaignId ? { campaignId: campaignId as Id<"campaigns"> } : "skip",
  );

  useEffect(() => {
    if (campaignId) {
      setSelectedCampaignId(campaignId as Id<"campaigns">);
    }
  }, [campaignId, setSelectedCampaignId]);

  if (!workspaceId || !campaignId) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>Unavailable</EmptyTitle>
            <EmptyDescription>
              Select a workspace and campaign.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (campaign === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (campaign === null) {
    return (
      <div className="p-4 md:p-6">
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>Campaign not found</EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const canEdit = canManageCampaignContent(campaign.lifecycle);
  const isLive = isLiveCampaignLifecycle(campaign.lifecycle);
  const detailHref = `/admin/campaigns/${campaignId}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1.5 text-muted-foreground"
          nativeButton={false}
          render={<Link href={detailHref} prefetch={false} />}
        >
          <RiArrowLeftLine className="size-4" />
          Back to campaign
        </Button>
        <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
      </div>

      {isLive ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-950 dark:text-amber-50">
          Live ({lifecycleLabel(campaign.lifecycle)}) — changes publish
          immediately and may affect votes already cast.
        </div>
      ) : null}

      {!canEdit ? (
        <p className="text-sm text-muted-foreground">
          {normalizeCampaignLifecycle(campaign.lifecycle)} campaigns cannot edit
          content.
        </p>
      ) : null}

      <CampaignCategoriesEditor
        campaignId={campaignId as Id<"campaigns">}
        disabled={!canEdit}
      />
    </div>
  );
}
