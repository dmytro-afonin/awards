"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { EditCampaignButton } from "@/components/admin/campaign-detail/edit-campaign-button";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { Button } from "@/components/ui/button";
import {
  canArchiveCampaign,
  canDeleteCampaign,
  canEditCampaignMetadata,
  canFinishCampaign,
  canLaunchFromDraft,
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
  awaitingReveal?: number;
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
  awaitingReveal = 0,
  disabled = false,
  layout = "stack",
  className,
}: CampaignLifecyclePanelProps) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const confirm = useConfirm();
  const state = normalizeCampaignLifecycle(lifecycle);

  const launch = useMutation(api.campaigns.launch);
  const goLiveAndVote = useMutation(api.campaigns.goLiveAndVote);
  const openVoting = useMutation(api.campaigns.openVoting);
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
      !(await confirm({
        title: "Launch campaign?",
        description: `Launch "${campaignName}"? The campaign will become visible but voting stays closed until you open it.`,
        confirmLabel: "Launch",
      }))
    ) {
      return;
    }
    await run(() => launch({ campaignId }), "Campaign launched — browse-only");
  }, [campaignId, campaignName, confirm, launch, run]);

  const handleGoLiveAndVote = useCallback(async () => {
    if (
      !(await confirm({
        title: "Launch and open voting?",
        description: `Launch "${campaignName}" and open voting immediately? Members will be able to vote right away.`,
        confirmLabel: "Launch & open voting",
      }))
    ) {
      return;
    }
    await run(
      () => goLiveAndVote({ campaignId }),
      "Campaign is live — voting open",
    );
  }, [campaignId, campaignName, confirm, goLiveAndVote, run]);

  const handleOpenVoting = useCallback(async () => {
    if (
      !(await confirm({
        title: "Open voting?",
        description: `Open voting for "${campaignName}"?`,
        confirmLabel: "Open voting",
      }))
    ) {
      return;
    }
    await run(() => openVoting({ campaignId }), "Voting is now open");
  }, [campaignId, campaignName, confirm, openVoting, run]);

  const handleFinish = useCallback(async () => {
    if (awaitingReveal > 0) {
      if (
        !(await confirm({
          title: "Publish remaining winners?",
          description: `${awaitingReveal} categor${awaitingReveal === 1 ? "y still has" : "ies still have"} unrevealed winners. Finishing "${campaignName}" will publish them all on the public campaign.`,
          confirmLabel: "Finish and publish all",
        }))
      ) {
        return;
      }
    } else if (
      !(await confirm({
        title: "Finish campaign?",
        description: `Finish "${campaignName}"? The campaign will move to finished and winners stay public.`,
        confirmLabel: "Finish campaign",
      }))
    ) {
      return;
    }
    await run(() => finishCampaign({ campaignId }), "Campaign finished");
  }, [awaitingReveal, campaignId, campaignName, confirm, finishCampaign, run]);

  const handleArchive = useCallback(async () => {
    if (
      !(await confirm({
        title: "Archive campaign?",
        description: `Archive "${campaignName}"? It will be hidden from the campaign list.`,
        confirmLabel: "Archive",
      }))
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
  }, [
    archiveCampaign,
    campaignId,
    campaignName,
    confirm,
    router,
    showShareMessage,
  ]);

  const handleDelete = useCallback(async () => {
    if (
      !(await confirm({
        title: "Delete campaign?",
        description: `Delete "${campaignName}"? It will be removed from the campaign list.`,
        confirmLabel: "Delete",
        variant: "destructive",
      }))
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
  }, [
    campaignId,
    campaignName,
    confirm,
    removeCampaign,
    router,
    showShareMessage,
  ]);

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

  const finishBtn = canFinishCampaign(lifecycle) ? (
    <Button
      key="finish"
      type="button"
      variant="outline"
      size="sm"
      className="bg-background/80 text-muted-foreground hover:text-foreground"
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
      launchAndVote ?? openVotingBtn ?? finishBtn ?? archiveBtn;

    return (
      <div
        className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}
      >
        {campaignPrimary}
        {launchBrowse && campaignPrimary === launchAndVote
          ? launchBrowse
          : null}
        {launchHint}
        {archivedNote}
      </div>
    );
  }

  if (layout === "toolbar") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {editDetails}
        {launchBrowse}
        {launchAndVote}
        {launchHint}
        {openVotingBtn}
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
      {launchBrowse}
      {launchAndVote}
      {launchHint}
      {openVotingBtn}
      {finishBtn}
      {archiveBtn}
      {deleteBtn}
      {viewPublicBtn}
      {archivedNote}
    </div>
  );
}
