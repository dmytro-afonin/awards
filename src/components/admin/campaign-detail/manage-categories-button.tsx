"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiNodeTree } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LiveCampaignWarningDialog } from "@/components/admin/campaign-detail/live-campaign-warning-dialog";
import { Button } from "@/components/ui/button";
import {
  canManageCampaignContent,
  isLiveCampaignLifecycle,
} from "@/lib/campaign-lifecycle";

const CONTENT_EDIT_BULLETS = [
  "New categories and nominees appear on the public page right away",
  "Removing nominees or categories can affect votes already cast",
  "Runway order and images update for voters immediately",
];

export function ManageCategoriesButton({
  campaignId,
  campaignName,
  lifecycle,
  disabled = false,
  size = "default",
  variant = "outline",
}: {
  campaignId: Id<"campaigns">;
  campaignName: string;
  lifecycle: string;
  disabled?: boolean;
  size?: "default" | "sm";
  variant?: "outline" | "ghost";
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const contentHref = `/admin/campaigns/${campaignId}/content`;

  const goToContent = useCallback(() => {
    router.push(contentHref);
  }, [contentHref, router]);

  const handleClick = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setDialogOpen(true);
      return;
    }
    goToContent();
  }, [goToContent, lifecycle]);

  if (!canManageCampaignContent(lifecycle)) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={handleClick}
      >
        <RiNodeTree />
        Manage categories
      </Button>

      <LiveCampaignWarningDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaignName={campaignName}
        lifecycle={lifecycle}
        title="Edit categories on a live campaign?"
        bullets={CONTENT_EDIT_BULLETS}
        confirmLabel="Continue to categories"
        onConfirm={goToContent}
      />
    </>
  );
}
