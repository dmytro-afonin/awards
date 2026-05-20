"use client";

import { LiveCampaignWarningDialog } from "@/components/admin/campaign-detail/live-campaign-warning-dialog";

const CAMPAIGN_EDIT_BULLETS = [
  "Name, slug, cover, and visibility update on the public page",
  "Shared links may break if you change the slug",
  "Voters may see updates while the show is running",
];

type LiveCampaignEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  lifecycle: string;
  onConfirm: () => void;
};

export function LiveCampaignEditDialog(props: LiveCampaignEditDialogProps) {
  return (
    <LiveCampaignWarningDialog
      {...props}
      title="Edit live campaign?"
      bullets={CAMPAIGN_EDIT_BULLETS}
      confirmLabel="Continue to edit"
    />
  );
}
