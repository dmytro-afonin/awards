"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import {
  canArchiveCampaign,
  canCloseVoting,
  canDeleteCampaign,
  canEditCampaignMetadata,
  canFinishCampaign,
  canLaunchFromDraft,
  canManageCampaignContent,
  canOpenVoting,
  canViewPublicCampaign,
  normalizeCampaignLifecycle,
} from "@/lib/campaign-lifecycle";
import { publicCampaignPath } from "@/lib/public-campaign-url";

type CampaignLifecyclePanelProps = {
  campaignId: Id<"campaigns">;
  campaignName: string;
  slug: string;
  workspaceId: Id<"workspaces">;
  lifecycle: string;
  canLaunch: boolean;
  disabled?: boolean;
};

export function CampaignLifecyclePanel({
  campaignId,
  campaignName,
  slug,
  workspaceId,
  lifecycle,
  canLaunch,
  disabled = false,
}: CampaignLifecyclePanelProps) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const state = normalizeCampaignLifecycle(lifecycle);

  const launch = useMutation(api.campaigns.launch);
  const goLiveAndVote = useMutation(api.campaigns.goLiveAndVote);
  const openVoting = useMutation(api.campaigns.openVoting);
  const closeVoting = useMutation(api.campaigns.closeVoting);
  const finishCampaign = useMutation(api.campaigns.finishCampaign);
  const archiveCampaign = useMutation(api.campaigns.archive);
  const removeCampaign = useMutation(api.campaigns.remove);

  const run = useCallback(
    async (action: () => Promise<unknown>, success: string) => {
      try {
        await action();
        showShareMessage(success);
        startTransition(() => router.refresh());
      } catch (error) {
        showShareMessage(
          error instanceof Error ? error.message : "Action failed.",
          "error",
        );
      }
    },
    [router, showShareMessage],
  );

  const handleLaunch = useCallback(async () => {
    if (
      !window.confirm(
        `Launch "${campaignName}"? The campaign will become visible but voting stays closed until you open it.`,
      )
    ) {
      return;
    }
    await run(() => launch({ campaignId }), "Campaign launched — browse-only");
  }, [campaignId, campaignName, launch, run]);

  const handleGoLiveAndVote = useCallback(async () => {
    if (
      !window.confirm(
        `Launch "${campaignName}" and open voting immediately? Members will be able to vote right away.`,
      )
    ) {
      return;
    }
    await run(
      () => goLiveAndVote({ campaignId }),
      "Campaign is live — voting open",
    );
  }, [campaignId, campaignName, goLiveAndVote, run]);

  const handleOpenVoting = useCallback(async () => {
    if (!window.confirm(`Open voting for "${campaignName}"?`)) {
      return;
    }
    await run(() => openVoting({ campaignId }), "Voting is now open");
  }, [campaignId, campaignName, openVoting, run]);

  const handleCloseVoting = useCallback(async () => {
    if (
      !window.confirm(
        `Close voting for "${campaignName}"? No more votes will be accepted.`,
      )
    ) {
      return;
    }
    await run(() => closeVoting({ campaignId }), "Voting closed");
  }, [campaignId, campaignName, closeVoting, run]);

  const handleFinish = useCallback(async () => {
    if (
      !window.confirm(
        `Finish "${campaignName}"? Winners will be published on the public campaign.`,
      )
    ) {
      return;
    }
    await run(() => finishCampaign({ campaignId }), "Campaign finished");
  }, [campaignId, campaignName, finishCampaign, run]);

  const handleArchive = useCallback(async () => {
    if (
      !window.confirm(
        `Archive "${campaignName}"? It will be hidden from the campaign list.`,
      )
    ) {
      return;
    }
    try {
      await archiveCampaign({ campaignId });
      showShareMessage("Campaign archived");
      startTransition(() => router.push("/admin"));
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not archive.",
        "error",
      );
    }
  }, [archiveCampaign, campaignId, campaignName, router, showShareMessage]);

  const handleDelete = useCallback(async () => {
    if (
      !window.confirm(
        `Delete "${campaignName}"? It will be removed from the campaign list.`,
      )
    ) {
      return;
    }
    try {
      await removeCampaign({ campaignId });
      showShareMessage("Campaign deleted");
      startTransition(() => router.push("/admin"));
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not delete.",
        "error",
      );
    }
  }, [campaignId, campaignName, removeCampaign, router, showShareMessage]);

  const publicHref = publicCampaignPath(slug, workspaceId);

  return (
    <div className="flex flex-col gap-2">
      {canEditCampaignMetadata(lifecycle) ? (
        <Button
          variant="outline"
          size="default"
          nativeButton={false}
          disabled={disabled}
          render={<Link href={`/admin/campaigns/${campaignId}/edit`} />}
        >
          Edit details
        </Button>
      ) : null}
      {canManageCampaignContent(lifecycle) ? (
        <Button
          variant="outline"
          size="default"
          nativeButton={false}
          disabled={disabled}
          render={<Link href={`/admin/campaigns/${campaignId}/content`} />}
        >
          Manage categories
        </Button>
      ) : null}
      {canLaunchFromDraft(lifecycle) && canLaunch ? (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={handleLaunch}
          >
            Launch (browse only)
          </Button>
          <Button
            type="button"
            disabled={disabled}
            onClick={handleGoLiveAndVote}
          >
            Launch & open voting
          </Button>
        </>
      ) : null}
      {canLaunchFromDraft(lifecycle) && !canLaunch ? (
        <p className="text-xs text-muted-foreground">
          Add at least one category with two nominees in each to launch.
        </p>
      ) : null}
      {canOpenVoting(lifecycle) ? (
        <Button type="button" disabled={disabled} onClick={handleOpenVoting}>
          Open voting
        </Button>
      ) : null}
      {canCloseVoting(lifecycle) ? (
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={handleCloseVoting}
        >
          Close voting
        </Button>
      ) : null}
      {canFinishCampaign(lifecycle) ? (
        <Button type="button" disabled={disabled} onClick={handleFinish}>
          Finish campaign
        </Button>
      ) : null}
      {canArchiveCampaign(lifecycle) ? (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={handleArchive}
        >
          Archive
        </Button>
      ) : null}
      {canDeleteCampaign(lifecycle) ? (
        <Button
          type="button"
          variant="destructive"
          disabled={disabled}
          onClick={handleDelete}
        >
          Delete
        </Button>
      ) : null}
      {canViewPublicCampaign(lifecycle) ? (
        <Button
          variant="ghost"
          size="default"
          nativeButton={false}
          disabled={disabled}
          render={<Link href={publicHref} prefetch={false} />}
        >
          View public page
        </Button>
      ) : null}
      {state === "archived" ? (
        <p className="text-sm text-muted-foreground">
          This campaign is archived.
        </p>
      ) : null}
    </div>
  );
}
