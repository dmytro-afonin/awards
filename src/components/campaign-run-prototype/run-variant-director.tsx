"use client";

import {
  CampaignRunHeader,
  CampaignRunStateStrip,
  FocusCategoryPanel,
  RunOfShowRail,
} from "@/components/campaign-run-prototype/campaign-run-shared";
import type { CampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";

/** A — Show Director (legacy layout; same actions as C) */
export function RunVariantDirector({ run }: { run: CampaignRunState }) {
  const focus = run.focusCategory;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <CampaignRunHeader run={run} />
      <div className="mt-6 flex flex-col gap-4 lg:flex-row">
        <RunOfShowRail run={run} />
        <main className="min-w-0 flex-1">
          {focus ? <FocusCategoryPanel run={run} category={focus} /> : null}
        </main>
      </div>
      <CampaignRunStateStrip run={run} />
    </div>
  );
}
