"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiStopCircleLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { EditCampaignButton } from "@/components/admin/campaign-detail/edit-campaign-button";
import { ManageCategoriesButton } from "@/components/admin/campaign-detail/manage-categories-button";
import { ToolbarActionButton } from "@/components/admin/campaign-detail/toolbar-icon-button";
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
import { cn } from "@/lib/utils";

type CampaignLifecyclePanelProps = {
  campaignId: Id<"campaigns">;
  campaignName: string;
  slug: string;
  workspaceId: Id<"workspaces">;
  lifecycle: string;
  canLaunch: boolean;
  disabled?: boolean;
  layout?: "stack" | "toolbar" | "compact-toolbar";
  className?: string;
};

export function CampaignLifecyclePanel({
  campaignId,
  campaignName,
  slug,
  workspaceId,
  lifecycle,
  canLaunch,
  disabled = false,
  layout = "stack",
  className,
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

  const editDetails = canEditCampaignMetadata(lifecycle) ? (
    <EditCampaignButton
      key="edit-details"
      campaignId={campaignId}
      campaignName={campaignName}
      lifecycle={lifecycle}
      disabled={disabled}
      size="sm"
    />
  ) : null;

  const manageCategories = canManageCampaignContent(lifecycle) ? (
    <ManageCategoriesButton
      key="manage-categories"
      campaignId={campaignId}
      campaignName={campaignName}
      lifecycle={lifecycle}
      disabled={disabled}
      size="sm"
    />
  ) : null;

  const launchBrowse =
    canLaunchFromDraft(lifecycle) && canLaunch ? (
      <Button
        key="launch-browse"
        type="button"
        variant="outline"
        size="sm"
        className="bg-background/80"
        disabled={disabled}
        onClick={handleLaunch}
      >
        Launch (browse only)
      </Button>
    ) : null;

  const launchAndVote =
    canLaunchFromDraft(lifecycle) && canLaunch ? (
      <Button
        key="launch-vote"
        type="button"
        size="sm"
        disabled={disabled}
        onClick={handleGoLiveAndVote}
      >
        Launch & open voting
      </Button>
    ) : null;

  const openVotingBtn = canOpenVoting(lifecycle) ? (
    <Button
      key="open-voting"
      type="button"
      size="sm"
      disabled={disabled}
      onClick={handleOpenVoting}
    >
      Open voting
    </Button>
  ) : null;

  const closeCampaignVotingBtn = canCloseVoting(lifecycle) ? (
    <ToolbarActionButton
      key="close-campaign-voting"
      label="End campaign voting"
      icon={<RiStopCircleLine className="size-4" />}
      variant="default"
      className="bg-sky-600 text-white hover:bg-sky-700"
      disabled={disabled}
      onClick={handleCloseVoting}
    />
  ) : null;

  const finishBtn = canFinishCampaign(lifecycle) ? (
    <Button
      key="finish"
      type="button"
      size="sm"
      disabled={disabled}
      onClick={handleFinish}
    >
      Finish campaign
    </Button>
  ) : null;

  const archiveBtn = canArchiveCampaign(lifecycle) ? (
    <Button
      key="archive"
      type="button"
      variant="outline"
      size="sm"
      className="bg-background/80"
      disabled={disabled}
      onClick={handleArchive}
    >
      Archive
    </Button>
  ) : null;

  const deleteBtn = canDeleteCampaign(lifecycle) ? (
    <Button
      key="delete"
      type="button"
      variant="destructive"
      size="sm"
      disabled={disabled}
      onClick={handleDelete}
    >
      Delete
    </Button>
  ) : null;

  const viewPublicBtn = canViewPublicCampaign(lifecycle) ? (
    <Button
      key="view-public"
      variant="outline"
      size="sm"
      className="bg-background/80"
      nativeButton={false}
      disabled={disabled}
      render={
        <Link
          href={publicHref}
          prefetch={false}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    >
      View campaign
    </Button>
  ) : null;

  const launchHint =
    canLaunchFromDraft(lifecycle) && !canLaunch ? (
      <p key="launch-hint" className="text-xs text-muted-foreground">
        Add at least one category with two nominees in each to launch.
      </p>
    ) : null;

  const archivedNote =
    state === "archived" ? (
      <p key="archived" className="text-sm text-muted-foreground">
        This campaign is archived.
      </p>
    ) : null;

  if (layout === "compact-toolbar") {
    const campaignPrimary =
      launchAndVote ??
      openVotingBtn ??
      closeCampaignVotingBtn ??
      finishBtn ??
      archiveBtn;

    return (
      <div
        className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      >
        {campaignPrimary}
        {launchBrowse && campaignPrimary === launchAndVote
          ? launchBrowse
          : null}
        {deleteBtn}
        {launchHint}
        {archivedNote}
      </div>
    );
  }

  if (layout === "toolbar") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {editDetails}
        {manageCategories}
        {launchBrowse}
        {launchAndVote}
        {launchHint}
        {openVotingBtn}
        {closeCampaignVotingBtn}
        {finishBtn}
        {archiveBtn}
        {deleteBtn}
        {viewPublicBtn}
        {archivedNote}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {editDetails}
      {manageCategories}
      {launchBrowse}
      {launchAndVote}
      {launchHint}
      {openVotingBtn}
      {closeCampaignVotingBtn}
      {finishBtn}
      {archiveBtn}
      {deleteBtn}
      {viewPublicBtn}
      {archivedNote}
    </div>
  );
}
