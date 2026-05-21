"use client";

import { useCallback, useMemo, useState } from "react";
import {
  INITIAL_CATEGORIES,
  type MockCategory,
  pickAutoWinner,
} from "@/components/campaign-run-prototype/campaign-run-mock";

function sortCategories(categories: MockCategory[]): MockCategory[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

function firstByStatus(
  categories: MockCategory[],
  status: MockCategory["status"],
): MockCategory | undefined {
  return sortCategories(categories).find((c) => c.status === status);
}

function countByStatus(
  categories: MockCategory[],
  status: MockCategory["status"],
): number {
  return categories.filter((c) => c.status === status).length;
}

export function useCampaignRunState() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [campaignVotingStopped, setCampaignVotingStopped] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>("Ready — voting live");

  const sorted = useMemo(() => sortCategories(categories), [categories]);
  const closeVoteHead = useMemo(
    () => firstByStatus(categories, "voting_open"),
    [categories],
  );
  const revealHead = useMemo(
    () => firstByStatus(categories, "voting_closed"),
    [categories],
  );

  const focusCategory = useMemo(() => {
    if (focusId) {
      return (
        sorted.find((c) => c.id === focusId) ?? closeVoteHead ?? revealHead
      );
    }
    return closeVoteHead ?? revealHead ?? sorted[0];
  }, [closeVoteHead, focusId, revealHead, sorted]);

  const votingOpenCount = countByStatus(categories, "voting_open");
  const awaitingRevealCount = countByStatus(categories, "voting_closed");
  const revealedCount = countByStatus(categories, "winner_revealed");
  const totalCount = sorted.length;

  const hasStartedRunway =
    revealedCount > 0 ||
    awaitingRevealCount > 0 ||
    (campaignVotingStopped && votingOpenCount < totalCount);

  const confirmOutOfOrderClose = useCallback(
    (target: MockCategory) => {
      const head = closeVoteHead;
      if (!head || target.id === head.id || target.status !== "voting_open") {
        return true;
      }
      return window.confirm(
        `Close voting for "${target.name}" before "${head.name}"?\n\nNo more votes will be accepted for this category.`,
      );
    },
    [closeVoteHead],
  );

  const confirmOutOfOrderReveal = useCallback(
    (target: MockCategory) => {
      const head = revealHead;
      if (!head || target.id === head.id || target.status !== "voting_closed") {
        return true;
      }
      return window.confirm(
        `Reveal winner for "${target.name}" before "${head.name}"?\n\nThe public page will show this winner out of show order.`,
      );
    },
    [revealHead],
  );

  const confirmBulkStopVoting = useCallback(() => {
    if (!hasStartedRunway || votingOpenCount === 0) {
      return window.confirm(
        `Stop voting for all ${votingOpenCount} categories still accepting votes?`,
      );
    }
    const done = revealedCount + awaitingRevealCount;
    return window.confirm(
      `You've already led ${done} of ${totalCount} categories.\n\nStop voting for the remaining ${votingOpenCount} categories?`,
    );
  }, [
    hasStartedRunway,
    revealedCount,
    awaitingRevealCount,
    totalCount,
    votingOpenCount,
  ]);

  const confirmBulkShowWinners = useCallback(() => {
    if (!hasStartedRunway || awaitingRevealCount === 0) {
      return window.confirm(
        `Show winners for all ${awaitingRevealCount} categories with closed voting?`,
      );
    }
    return window.confirm(
      `You've revealed ${revealedCount} of ${totalCount} winners.\n\nShow winners for the remaining ${awaitingRevealCount} categories?`,
    );
  }, [hasStartedRunway, revealedCount, awaitingRevealCount, totalCount]);

  const advanceFocusAfterAction = useCallback(
    (nextCategories: MockCategory[]) => {
      const sortedNext = sortCategories(nextCategories);
      const next =
        sortedNext.find((c) => c.status === "voting_open") ??
        sortedNext.find((c) => c.status === "voting_closed");
      setFocusId(next?.id ?? null);
    },
    [],
  );

  const closeCategoryVoting = useCallback(
    (categoryId: string) => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target || target.status !== "voting_open") return;
      if (!confirmOutOfOrderClose(target)) return;

      const winner = pickAutoWinner(target);
      const next = categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              status: "voting_closed" as const,
              winnerNomineeId: winner?.id,
            }
          : c,
      );
      setCategories(next);
      setLastAction(
        `Closed voting for "${target.name}" — winner locked (${winner?.name ?? "—"}, not public yet)`,
      );
      advanceFocusAfterAction(next);
    },
    [advanceFocusAfterAction, categories, confirmOutOfOrderClose],
  );

  const revealCategoryWinner = useCallback(
    (categoryId: string) => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target || target.status !== "voting_closed") return;
      if (!confirmOutOfOrderReveal(target)) return;

      const next = categories.map((c) =>
        c.id === categoryId ? { ...c, status: "winner_revealed" as const } : c,
      );
      setCategories(next);
      const name = target.winnerNomineeId
        ? getWinnerName(target, target.winnerNomineeId)
        : undefined;
      setLastAction(
        `Revealed winner for "${target.name}" → ${name ?? "—"} on public page`,
      );
      advanceFocusAfterAction(next);
    },
    [advanceFocusAfterAction, categories, confirmOutOfOrderReveal],
  );

  const stopCampaignVoting = useCallback(() => {
    if (votingOpenCount === 0) return;
    if (!confirmBulkStopVoting()) return;

    setCampaignVotingStopped(true);
    const next = categories.map((c) => {
      if (c.status !== "voting_open") return c;
      const winner = pickAutoWinner(c);
      return {
        ...c,
        status: "voting_closed" as const,
        winnerNomineeId: winner?.id,
      };
    });
    setCategories(next);
    setLastAction(
      `Campaign — stopped voting on ${votingOpenCount} categories (winners not public yet)`,
    );
    advanceFocusAfterAction(next);
  }, [
    advanceFocusAfterAction,
    categories,
    confirmBulkStopVoting,
    votingOpenCount,
  ]);

  const showAllWinners = useCallback(() => {
    if (awaitingRevealCount === 0) return;
    if (votingOpenCount > 0 && !campaignVotingStopped) return;
    if (!confirmBulkShowWinners()) return;

    const next = categories.map((c) =>
      c.status === "voting_closed"
        ? { ...c, status: "winner_revealed" as const }
        : c,
    );
    setCategories(next);
    setLastAction(
      `Campaign — showed winners for ${awaitingRevealCount} categories on public page`,
    );
    advanceFocusAfterAction(next);
  }, [
    advanceFocusAfterAction,
    awaitingRevealCount,
    campaignVotingStopped,
    categories,
    confirmBulkShowWinners,
    votingOpenCount,
  ]);

  const selectCategory = useCallback(
    (categoryId: string) => {
      const target = categories.find((c) => c.id === categoryId);
      if (!target) return;
      setFocusId(categoryId);
      setLastAction(`Focus → "${target.name}"`);
    },
    [categories],
  );

  const goToRunwayHead = useCallback(() => {
    const head = closeVoteHead ?? revealHead;
    if (head) {
      setFocusId(head.id);
      setLastAction(`Focus → runway head "${head.name}"`);
    }
  }, [closeVoteHead, revealHead]);

  const resetDemo = useCallback(() => {
    setCategories(INITIAL_CATEGORIES);
    setCampaignVotingStopped(false);
    setFocusId(null);
    setLastAction("Demo reset");
  }, []);

  return {
    sorted,
    closeVoteHead,
    revealHead,
    focusCategory,
    focusId,
    campaignVotingStopped,
    votingOpenCount,
    awaitingRevealCount,
    revealedCount,
    totalCount,
    hasStartedRunway,
    lastAction,
    closeCategoryVoting,
    revealCategoryWinner,
    stopCampaignVoting,
    showAllWinners,
    selectCategory,
    goToRunwayHead,
    resetDemo,
  };
}

function getWinnerName(
  category: MockCategory,
  nomineeId: string,
): string | undefined {
  return category.nominees.find((n) => n.id === nomineeId)?.name;
}

export type CampaignRunState = ReturnType<typeof useCampaignRunState>;
