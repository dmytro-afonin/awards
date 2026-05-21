"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { RiTrophyLine } from "@remixicon/react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { startTransition, useCallback } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import {
  type CategoryOverview,
  countCategoriesByStatus,
} from "@/lib/category-run";

export function CampaignRunSidebarActions({
  campaignId,
  categories,
}: {
  campaignId: Id<"campaigns">;
  categories: CategoryOverview[];
}) {
  const router = useRouter();
  const { showShareMessage } = useAdmin();
  const revealAll = useMutation(
    api.campaignCategories.revealAllCategoryWinners,
  );

  const awaitingReveal = countCategoriesByStatus(categories, "voting_closed");

  const confirmRevealAll = useCallback(() => {
    if (awaitingReveal === 0) return false;
    return window.confirm(
      `Show winners for all ${awaitingReveal} categories with closed voting?`,
    );
  }, [awaitingReveal]);

  const handleRevealAll = useCallback(async () => {
    if (!confirmRevealAll()) return;
    try {
      const count = await revealAll({ campaignId });
      showShareMessage(
        count > 0
          ? `Showed winners for ${count} categories`
          : "No categories awaiting reveal",
      );
      startTransition(() => router.refresh());
    } catch (error) {
      showShareMessage(
        error instanceof Error ? error.message : "Could not show winners.",
        "error",
      );
    }
  }, [campaignId, confirmRevealAll, revealAll, router, showShareMessage]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="border-amber-500/40 bg-amber-500/10 text-amber-950 hover:bg-amber-500/20 dark:text-amber-50"
      disabled={awaitingReveal === 0}
      onClick={() => void handleRevealAll()}
    >
      <RiTrophyLine />
      Reveal all winners
    </Button>
  );
}
