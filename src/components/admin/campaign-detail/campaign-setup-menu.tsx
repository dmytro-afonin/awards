"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiNodeTree, RiPencilLine, RiSettings3Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LiveCampaignEditDialog } from "@/components/admin/campaign-detail/live-campaign-edit-dialog";
import { LiveCampaignWarningDialog } from "@/components/admin/campaign-detail/live-campaign-warning-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);

  const canEdit = canEditCampaignMetadata(lifecycle);
  const canManage = canManageCampaignContent(lifecycle);
  const editHref = `/admin/campaigns/${campaignId}/edit`;
  const contentHref = `/admin/campaigns/${campaignId}/content`;

  const goToEdit = useCallback(() => {
    router.push(editHref);
  }, [editHref, router]);

  const goToContent = useCallback(() => {
    router.push(contentHref);
  }, [contentHref, router]);

  const handleEdit = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setEditDialogOpen(true);
      return;
    }
    goToEdit();
  }, [goToEdit, lifecycle]);

  const handleCategories = useCallback(() => {
    if (isLiveCampaignLifecycle(lifecycle)) {
      setContentDialogOpen(true);
      return;
    }
    goToContent();
  }, [goToContent, lifecycle]);

  if (!canEdit && !canManage) {
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
