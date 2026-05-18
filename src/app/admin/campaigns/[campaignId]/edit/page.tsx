"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { useParams } from "next/navigation";
import { CampaignEditor } from "@/components/admin/campaign-editor";

export default function AdminEditCampaignPage() {
  const params = useParams();
  const raw = params.campaignId;
  const campaignId =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;

  if (!campaignId) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">Missing campaign id.</p>
      </div>
    );
  }

  return <CampaignEditor campaignId={campaignId as Id<"campaigns">} />;
}
