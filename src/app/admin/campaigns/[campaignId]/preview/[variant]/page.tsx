"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { useParams } from "next/navigation";
import { LayoutCompareBar } from "@/components/admin/campaign-detail/layout-compare-bar";
import { CampaignDetailVariantA } from "@/components/admin/campaign-detail/variant-a-control-panel";
import { CampaignDetailVariantB } from "@/components/admin/campaign-detail/variant-b-hero-dashboard";
import { usePreviewVariant } from "@/components/admin/campaign-detail/variant-switcher";
export default function CampaignPreviewPage() {
  const params = useParams();
  const variant = usePreviewVariant();
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

  if (!variant) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <p className="text-sm text-muted-foreground">
          Unknown layout variant. Choose A or B.
        </p>
        <LayoutCompareBar
          campaignId={campaignId as Id<"campaigns">}
          active="a"
        />
      </div>
    );
  }

  const id = campaignId as Id<"campaigns">;

  switch (variant) {
    case "a":
      return <CampaignDetailVariantA campaignId={id} />;
    case "b":
      return <CampaignDetailVariantB campaignId={id} />;
    default:
      return null;
  }
}
