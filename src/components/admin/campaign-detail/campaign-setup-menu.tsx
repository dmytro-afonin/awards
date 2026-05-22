"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  RiDeleteBinLine,
  RiNodeTree,
  RiPencilLine,
  RiSettings3Line,
} from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useState } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { LiveCampaignEditDialog } from "@/components/admin/campaign-detail/live-campaign-edit-dialog";
import { LiveCampaignWarningDialog } from "@/components/admin/campaign-detail/live-campaign-warning-dialog";
import { useConfirm } from "@/components/confirm-dialog-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canDeleteCampaign,
  canEditCampaignMetadata,
  canManageCampaignContent,
  isLiveCampaignLifecycle,
} from "@/lib/campaign-lifecycle";

const CONTENT_EDIT_BULLETS = [
  "New categories and nominees appear on the public page right away",
  "Removing nominees or categories can affect votes already cast",
  "Runway order and images update for voters immediately",
];

export function CampaignSetupMenu({
  campaignId,
  campaignName,
  lifecycle,
  disabled = false,
}: {
  campaignId: Id<"campaigns">;
  campaignName: string;
  lifecycle: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const confirm = useConfirm();
  const removeCampaign = useMutation(api.campaigns.remove);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

  const canEdit = canEditCampaignMetadata(lifecycle);
  const canManage = canManageCampaignContent(lifecycle);
  const canDelete = canDeleteCampaign(lifecycle);
  const editHref = `/admin/campaigns/${campaignId}/edit`;
  const contentHref = `/admin/campaigns/${campaignId}/content`;

  const goToEdit = useCallback(() => {
    router.push(editHref);
  }, [editHref, router]);

  const handleEdit = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setEditDialogOpen(true);
      return;
    }
    goToEdit();
  }, [goToEdit, lifecycle]);

  const goToContent = useCallback(() => {
    router.push(contentHref);
  }, [contentHref, router]);

  const handleCategories = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setContentDialogOpen(true);
      return;
    }
    goToContent();
  }, [goToContent, lifecycle]);

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

  if (!canEdit && !canManage && !canDelete) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <DropdownMenuTrigger
            render={
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-8 shrink-0 gap-1.5 xl:h-8 xl:w-auto xl:px-2.5"
                    disabled={disabled}
                  />
                }
              />
            }
          >
            <RiSettings3Line className="size-4 shrink-0" />
            <span className="hidden xl:inline">Settings</span>
            <span className="sr-only xl:hidden">Campaign settings</span>
          </DropdownMenuTrigger>
          <TooltipContent className="xl:hidden">
            Campaign settings
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="min-w-44">
          {canEdit ? (
            <DropdownMenuItem onClick={handleEdit}>
              <RiPencilLine />
              Edit campaign
            </DropdownMenuItem>
          ) : null}
          {canManage ? (
            <DropdownMenuItem onClick={handleCategories}>
              <RiNodeTree />
              Manage categories
            </DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => void handleDelete()}
              >
                <RiDeleteBinLine />
                Delete campaign
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <LiveCampaignEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        campaignName={campaignName}
        lifecycle={lifecycle}
        onConfirm={goToEdit}
      />

      <LiveCampaignWarningDialog
        open={contentDialogOpen}
        onOpenChange={setContentDialogOpen}
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
