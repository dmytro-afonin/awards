"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiPencilLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LiveCampaignEditDialog } from "@/components/admin/campaign-detail/live-campaign-edit-dialog";
import { Button } from "@/components/ui/button";
import {
  canEditCampaignMetadata,
  isLiveCampaignLifecycle,
} from "@/lib/campaign-lifecycle";

export function EditCampaignButton({
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
  const editHref = `/admin/campaigns/${campaignId}/edit`;

  const goToEdit = useCallback(() => {
    router.push(editHref);
  }, [editHref, router]);

  const handleEdit = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setDialogOpen(true);
      return;
    }
    goToEdit();
  }, [goToEdit, lifecycle]);

  if (!canEditCampaignMetadata(lifecycle)) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={handleEdit}
      >
        <RiPencilLine />
        Edit campaign
      </Button>

      <LiveCampaignEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        campaignName={campaignName}
        lifecycle={lifecycle}
        onConfirm={goToEdit}
      />
    </>
  );
}
