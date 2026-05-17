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
  canEditCampaignLifecycle,
  canFinishCampaign,
  canLaunchCampaign,
} from "@/lib/campaign-lifecycle";

type CampaignLifecycleActionsProps = {
  campaignId: Id<"campaigns">;
  campaignName: string;
  lifecycle: string;
  disabled?: boolean;
  size?: "sm" | "default";
  /** Hide Edit (e.g. on the campaign editor page). */
  hideEdit?: boolean;
  /** After archive/delete from editor, navigate away. */
  onArchived?: () => void;
};

export function CampaignLifecycleActions({
  campaignId,
  campaignName,
  lifecycle,
  disabled = false,
  size = "sm",
  hideEdit = false,
  onArchived,
}: CampaignLifecycleActionsProps) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const launchCampaign = useMutation(api.campaigns.launch);
  const finishCampaign = useMutation(api.campaigns.finish);
  const archiveCampaign = useMutation(api.campaigns.archive);

  const canEdit = !hideEdit && canEditCampaignLifecycle(lifecycle);
  const canLaunch = canLaunchCampaign(lifecycle);
  const canFinish = canFinishCampaign(lifecycle);
  const canArchive = canArchiveCampaign(lifecycle);

  const handleLaunch = useCallback(async () => {
    if (
      !window.confirm(
        `Launch "${campaignName}"? Voting will open for eligible members.`,
      )
    ) {
      return;
    }
    try {
      await launchCampaign({ campaignId });
      showShareMessage("Campaign launched");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not launch campaign.";
      showShareMessage(message, "error");
    }
  }, [campaignId, campaignName, launchCampaign, router, showShareMessage]);

  const handleFinish = useCallback(async () => {
    if (
      !window.confirm(
        `Finish "${campaignName}"? Voting will close and results will be final.`,
      )
    ) {
      return;
    }
    try {
      await finishCampaign({ campaignId });
      showShareMessage("Campaign finished");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not finish campaign.";
      showShareMessage(message, "error");
    }
  }, [campaignId, campaignName, finishCampaign, router, showShareMessage]);

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
      if (onArchived) {
        onArchived();
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not archive campaign.";
      showShareMessage(message, "error");
    }
  }, [
    archiveCampaign,
    campaignId,
    campaignName,
    onArchived,
    router,
    showShareMessage,
  ]);

  if (!canEdit && !canLaunch && !canFinish && !canArchive) {
    return null;
  }

  const editHref = `/admin/campaigns/${campaignId}`;

  return (
    <>
      {canEdit ? (
        <Button
          variant="outline"
          size={size}
          nativeButton={false}
          disabled={disabled}
          render={<Link href={editHref} prefetch />}
        >
          Edit
        </Button>
      ) : null}
      {canLaunch ? (
        <Button
          variant="default"
          size={size}
          type="button"
          disabled={disabled}
          onClick={handleLaunch}
        >
          Launch
        </Button>
      ) : null}
      {canFinish ? (
        <Button
          variant="secondary"
          size={size}
          type="button"
          disabled={disabled}
          onClick={handleFinish}
        >
          Finish
        </Button>
      ) : null}
      {canArchive ? (
        <Button
          variant="outline"
          size={size}
          type="button"
          disabled={disabled}
          onClick={handleArchive}
        >
          Archive
        </Button>
      ) : null}
    </>
  );
}
