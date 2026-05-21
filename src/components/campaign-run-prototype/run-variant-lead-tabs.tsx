"use client";

import { useState } from "react";
import {
  CampaignRunHeader,
  CampaignRunStateStrip,
  FocusCategoryPanel,
  OverviewCategoryRow,
  RunOfShowRail,
  RunwayNavFooter,
} from "@/components/campaign-run-prototype/campaign-run-shared";
import type { CampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** C — Lead mode (runway rail + focus) vs Overview */
export function RunVariantLeadTabs({ run }: { run: CampaignRunState }) {
  const [tab, setTab] = useState("lead");
  const focus = run.focusCategory;
  const leadIndex = focus
    ? run.sorted.findIndex((c) => c.id === focus.id) + 1
    : 0;

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      <CampaignRunHeader run={run} />

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="lead">Lead mode</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="lead" className="mt-4">
          {focus ? (
            <p className="mb-3 text-sm text-muted-foreground">
              Category{" "}
              <span className="font-medium text-foreground tabular-nums">
                {leadIndex} / {run.totalCount}
              </span>
            </p>
          ) : (
            <p className="mb-3 text-sm text-muted-foreground">
              Run complete — all winners are public.
            </p>
          )}

          <div className="flex flex-col gap-4 lg:flex-row">
            <RunOfShowRail run={run} />
            <div className="min-w-0 flex-1 space-y-4">
              {focus ? (
                <>
                  <FocusCategoryPanel run={run} category={focus} />
                  <RunwayNavFooter run={run} categoryId={focus.id} />
                </>
              ) : null}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Full category list — same actions as lead mode, including separate
            close voting and show winner.
          </p>
          <ul className="flex flex-col gap-4">
            {run.sorted.map((cat, i) => (
              <OverviewCategoryRow
                key={cat.id}
                run={run}
                category={cat}
                index={i}
              />
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <CampaignRunStateStrip run={run} />
    </div>
  );
}
