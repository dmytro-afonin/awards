"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  RiExternalLinkLine,
  RiShareLine,
  RiSkipDownLine,
  RiStopCircleLine,
  RiTrophyLine,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { CampaignLifecyclePanel } from "@/components/admin/campaign-detail/campaign-lifecycle-panel";
import { CampaignSetupMenu } from "@/components/admin/campaign-detail/campaign-setup-menu";
import type { CategoryOverview } from "@/components/admin/campaign-detail/shared-parts";
import {
  ToolbarActionButton,
  ToolbarDivider,
} from "@/components/admin/campaign-detail/toolbar-icon-button";
import { useConfirm } from "@/components/confirm-dialog-provider";
import {
  canCloseVoting,
  canViewPublicCampaign,
} from "@/lib/campaign-lifecycle";
import {
  countCategoriesByStatus,
  currentRunwayCategory,
  hasUnrevealedCategoryWinners,
  isCategoryRunLifecycle,
} from "@/lib/category-run";
import { publicCampaignPath } from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

type CampaignManagementBarProps = {
  campaignId: Id<"campaigns">;
  campaignName: string;
  slug: string;
  workspaceId: Id<"workspaces">;
  lifecycle: string;
  canLaunch: boolean;
  categories: CategoryOverview[];
  showRunTools: boolean;
  className?: string;
};

export function CampaignManagementBar({
  campaignId,
  campaignName,
  slug,
  workspaceId,
  lifecycle,
  canLaunch,
  categories,
  showRunTools,
  className,
}: CampaignManagementBarProps) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const confirm = useConfirm();
  const revealAll = useMutation(
    api.campaignCategories.revealAllCategoryWinners,
  );
  const closeVoting = useMutation(api.campaigns.closeVoting);
  const closeAllCategoryVoting = useMutation(
    api.campaignCategories.closeAllCategoryVoting,
  );

  const runwayCategory = currentRunwayCategory(categories);
  const votingOpenCount = countCategoriesByStatus(categories, "open");
  const awaitingReveal = countCategoriesByStatus(categories, "voting_closed");
  const hasUnrevealedWinners = hasUnrevealedCategoryWinners(categories);
  const publicHref = publicCampaignPath(slug, workspaceId);
  const showPublic = canViewPublicCampaign(lifecycle);
  const showJump = showRunTools && hasUnrevealedWinners;
  const showRevealAll = showRunTools && hasUnrevealedWinners;
  const showCloseVotes =
    isCategoryRunLifecycle(lifecycle) && votingOpenCount > 0;
  const revealAllDisabled = awaitingReveal === 0;
  const toolbarRunActionClassName = "size-8 shrink-0";

  const handleJumpToCurrent = useCallback(() => {
    if (!runwayCategory) return;
    document
      .getElementById(`admin-category-${runwayCategory._id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [runwayCategory]);

  const handleRevealAll = useCallback(async () => {
    if (awaitingReveal === 0) return;
    if (
      !(await confirm({
        title: "Show all winners?",
        description: `Show winners for all ${awaitingReveal} categories with closed voting?`,
        confirmLabel: "Show winners",
      }))
    ) {
      return;
    }
    try {
      const count = await revealAll({ campaignId });
      showShareMessage(
        count > 0
          ? `Showed winners for ${count} categories`
          : "No categories awaiting reveal",
      );
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not show winners.",
        "error",
      );
    }
  }, [
    awaitingReveal,
    campaignId,
    confirm,
    revealAll,
    router,
    showShareMessage,
  ]);

  const handleCloseVotes = useCallback(async () => {
    if (votingOpenCount === 0) return;
    if (
      !(await confirm({
        title: "Close voting?",
        description:
          votingOpenCount === 1
            ? `Close voting for the open category on "${campaignName}"? No more votes will be accepted.`
            : `Close voting for all ${votingOpenCount} open categories on "${campaignName}"? No more votes will be accepted.`,
        confirmLabel: "Close voting",
      }))
    ) {
      return;
    }
    try {
      if (canCloseVoting(lifecycle)) {
        await closeVoting({ campaignId });
        showShareMessage("Voting closed");
      } else {
        const closed = await closeAllCategoryVoting({ campaignId });
        showShareMessage(
          closed > 0
            ? `Closed voting for ${closed} categor${closed === 1 ? "y" : "ies"}`
            : "No categories with open voting",
        );
      }
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not close voting.",
        "error",
      );
    }
  }, [
    campaignId,
    campaignName,
    closeAllCategoryVoting,
    closeVoting,
    confirm,
    lifecycle,
    router,
    showShareMessage,
    votingOpenCount,
  ]);

  const handleShare = useCallback(async () => {
    const publicUrl = `${window.location.origin}${publicHref}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showShareMessage("Campaign link copied");
    } catch {
      showShareMessage("Could not copy link", "error");
    }
  }, [publicHref, showShareMessage]);

  return (
    <section
      className={cn(
        "sticky top-0 z-20 flex items-center gap-1 rounded-xl border border-border bg-card/95 px-2 py-1.5 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-card/90 sm:gap-2 sm:px-3",
        className,
      )}
    >
      {showJump ? (
        <>
          <ToolbarActionButton
            label="Jump to current"
            icon={<RiSkipDownLine className="size-4" />}
            disabled={!runwayCategory}
            variant="default"
            labelMode="always"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleJumpToCurrent}
          />
          {showRevealAll || showCloseVotes ? <ToolbarDivider /> : null}
        </>
      ) : null}

      {showRevealAll ? (
        <ToolbarActionButton
          label="Reveal all winners"
          icon={<RiTrophyLine className="size-4" />}
          disabled={revealAllDisabled}
          variant="secondary"
          labelMode="icon-only"
          className={toolbarRunActionClassName}
          onClick={() => void handleRevealAll()}
        />
      ) : null}

      {showCloseVotes ? (
        <ToolbarActionButton
          label="Close votes"
          icon={<RiStopCircleLine className="size-4" />}
          variant="secondary"
          labelMode="icon-only"
          className={toolbarRunActionClassName}
          onClick={() => void handleCloseVotes()}
        />
      ) : null}

      <div className="min-h-px flex-1" aria-hidden />

      <div className="flex shrink-0 items-center gap-1">
        <CampaignLifecyclePanel
          campaignId={campaignId}
          campaignName={campaignName}
          slug={slug}
          workspaceId={workspaceId}
          lifecycle={lifecycle}
          canLaunch={canLaunch}
          awaitingReveal={awaitingReveal}
          layout="compact-toolbar"
        />

        <ToolbarDivider />

        <CampaignSetupMenu
          campaignId={campaignId}
          campaignName={campaignName}
          lifecycle={lifecycle}
        />

        {showPublic ? (
          <>
            <ToolbarActionButton
              label="View public page"
              icon={<RiExternalLinkLine className="size-4" />}
              variant="ghost"
              className="size-8"
              render={
                <Link
                  href={publicHref}
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            />
            <ToolbarActionButton
              label="Share campaign"
              icon={<RiShareLine className="size-4" />}
              variant="ghost"
              className="size-8"
              onClick={() => void handleShare()}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
