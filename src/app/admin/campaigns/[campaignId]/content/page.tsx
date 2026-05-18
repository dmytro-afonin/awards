"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignCategoriesEditor } from "@/components/admin/campaign-categories-editor";
import { CampaignLifecycleBadge } from "@/components/admin/campaign-lifecycle-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  canManageCampaignContent,
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
      <div className="flex flex-col gap-3 p-4 md:p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full max-w-xl" />
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

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 p-4 md:p-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>Categories & nominees</CardTitle>
            <CampaignLifecycleBadge lifecycle={campaign.lifecycle} />
          </div>
          <CardDescription>
            {canEdit
              ? "Add categories and nominees while the campaign is in draft."
              : `${normalizeCampaignLifecycle(campaign.lifecycle)} campaigns cannot edit content.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignCategoriesEditor
            campaignId={campaignId as Id<"campaigns">}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
