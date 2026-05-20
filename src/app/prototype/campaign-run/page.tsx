"use client";

/**
 * PROTOTYPE — Four "lead the campaign" admin layouts during vote_live.
 * Question: "How should managers close categories and reveal winners in order?"
 * Switch: ?variant=A|B|C|D. In-memory state shared per session (resets on reload).
 */

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CampaignRunPrototypeBanner } from "@/components/campaign-run-prototype/campaign-run-shared";
import {
  CampaignRunVariantSwitcher,
  parseCampaignRunVariant,
} from "@/components/campaign-run-prototype/campaign-run-variant-switcher";
import { RunVariantDirector } from "@/components/campaign-run-prototype/run-variant-director";
import { RunVariantLeadTabs } from "@/components/campaign-run-prototype/run-variant-lead-tabs";
import { RunVariantQueue } from "@/components/campaign-run-prototype/run-variant-queue";
import { RunVariantTimeline } from "@/components/campaign-run-prototype/run-variant-timeline";
import { useCampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";

function CampaignRunPrototypeInner() {
  const searchParams = useSearchParams();
  const variant = parseCampaignRunVariant(searchParams.get("variant"));
  const run = useCampaignRunState();

  return (
    <div className="min-h-screen bg-background pb-24">
      <CampaignRunPrototypeBanner />

      {variant === "A" ? <RunVariantDirector run={run} /> : null}
      {variant === "B" ? <RunVariantTimeline run={run} /> : null}
      {variant === "C" ? <RunVariantLeadTabs run={run} /> : null}
      {variant === "D" ? <RunVariantQueue run={run} /> : null}

      <CampaignRunVariantSwitcher current={variant} />
    </div>
  );
}

export default function CampaignRunPrototypePage() {
  return (
    <Suspense fallback={null}>
      <CampaignRunPrototypeInner />
    </Suspense>
  );
}
