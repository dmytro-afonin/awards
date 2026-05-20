"use client";

import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiRefreshLine,
  RiStopCircleLine,
  RiTrophyLine,
} from "@remixicon/react";
import {
  categoryStatusLabel,
  getNominee,
  MOCK_CAMPAIGN,
  type MockCategory,
} from "@/components/campaign-run-prototype/campaign-run-mock";
import type { CampaignRunState } from "@/components/campaign-run-prototype/use-campaign-run-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function CampaignRunPrototypeBanner() {
  return (
    <div className="pointer-events-none fixed left-4 top-4 z-[90] max-w-sm">
      <div className="pointer-events-auto rounded-lg border border-amber-400/50 bg-amber-950/90 px-3 py-2 text-[11px] text-amber-50 shadow-lg backdrop-blur-md">
        <p className="font-semibold uppercase tracking-wider">
          Campaign run prototype
        </p>
        <p className="mt-1 text-amber-100/90">
          Variant C = preferred direction (Lead + runway rail). Close voting and
          show winners are separate — per category and campaign-wide.
        </p>
      </div>
    </div>
  );
}

export function CampaignRunStateStrip({ run }: { run: CampaignRunState }) {
  return (
    <div className="mt-6 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 font-mono text-[11px] text-muted-foreground">
      <p>
        <span className="text-foreground">Last:</span> {run.lastAction}
      </p>
      <p className="mt-1">
        Open {run.votingOpenCount} · Awaiting reveal {run.awaitingRevealCount} ·
        Revealed {run.revealedCount}/{run.totalCount}
        {run.campaignVotingStopped ? " · campaign voting stopped" : ""}
        {run.closeVoteHead
          ? ` · Close-vote head: ${run.closeVoteHead.name}`
          : ""}
        {run.revealHead ? ` · Reveal head: ${run.revealHead.name}` : ""}
      </p>
    </div>
  );
}

export function CampaignRunHeader({ run }: { run: CampaignRunState }) {
  return (
    <header className="space-y-4 border-b border-border pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live campaign
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            {MOCK_CAMPAIGN.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {run.campaignVotingStopped ? (
              <Badge variant="secondary">Campaign voting stopped</Badge>
            ) : (
              <Badge className="bg-emerald-600/15 text-emerald-800 dark:text-emerald-200">
                Vote live
              </Badge>
            )}
            <Badge variant="outline" className="tabular-nums">
              {run.revealedCount}/{run.totalCount} winners public
            </Badge>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={run.resetDemo}
        >
          <RiRefreshLine />
          Reset demo
        </Button>
      </div>

      <CampaignWideActions run={run} />
    </header>
  );
}

/** Campaign-level stop voting / show winners (separate operations) */
export function CampaignWideActions({ run }: { run: CampaignRunState }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Whole campaign
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={run.votingOpenCount === 0}
          onClick={() => run.stopCampaignVoting()}
        >
          <RiStopCircleLine />
          Stop voting
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={run.awaitingRevealCount === 0}
          onClick={() => run.showAllWinners()}
        >
          <RiTrophyLine />
          Show winners
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Stop voting closes ballots (winners stay hidden). Show winners publishes
        categories that already have closed voting.
      </p>
    </div>
  );
}

export function CategoryStatusDot({
  status,
  isFocus,
  isCloseHead,
  isRevealHead,
}: {
  status: MockCategory["status"];
  isFocus?: boolean;
  isCloseHead?: boolean;
  isRevealHead?: boolean;
}) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        status === "winner_revealed" && "bg-emerald-500",
        status === "voting_closed" && "bg-amber-500",
        status === "voting_open" &&
          isCloseHead &&
          "bg-primary ring-2 ring-primary/30",
        status === "voting_open" && !isCloseHead && "bg-muted-foreground/40",
        isRevealHead &&
          status === "voting_closed" &&
          "ring-2 ring-amber-400/80",
        isFocus && "ring-2 ring-foreground/30",
      )}
      aria-hidden
    />
  );
}

export function RunOfShowRail({ run }: { run: CampaignRunState }) {
  const focus = run.focusCategory;

  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Run of show
      </p>
      <ScrollArea className="h-[min(420px,50vh)] rounded-xl border border-border bg-muted/20 pr-3">
        <ol className="flex flex-col gap-0.5 p-2">
          {run.sorted.map((cat, i) => {
            const isFocus = focus?.id === cat.id;
            return (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => run.selectCategory(cat.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                    isFocus && "bg-primary/10 ring-1 ring-primary/30",
                    !isFocus && "hover:bg-muted/60",
                  )}
                >
                  <span className="w-5 shrink-0 tabular-nums text-xs text-muted-foreground">
                    {i + 1}
                  </span>
                  <CategoryStatusDot
                    status={cat.status}
                    isFocus={isFocus}
                    isCloseHead={run.closeVoteHead?.id === cat.id}
                    isRevealHead={run.revealHead?.id === cat.id}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {cat.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </ScrollArea>
      {run.closeVoteHead || run.revealHead ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 w-full"
          onClick={run.goToRunwayHead}
        >
          Jump to runway head
        </Button>
      ) : null}
    </aside>
  );
}

export function NomineeStrip({
  category,
  showWinner,
}: {
  category: MockCategory;
  showWinner: boolean;
}) {
  const winnerId = category.winnerNomineeId;
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {category.nominees.map((nominee) => {
        const isWinner = showWinner && winnerId === nominee.id;
        return (
          <article
            key={nominee.id}
            className={cn(
              "w-[8.5rem] shrink-0 rounded-lg border bg-card p-2 ring-1 ring-border",
              isWinner && "border-amber-500/50 ring-amber-500/30",
            )}
          >
            <div className="relative mb-2 flex aspect-square items-center justify-center rounded-md bg-muted text-sm font-semibold text-muted-foreground">
              {nominee.name.slice(0, 2).toUpperCase()}
              {isWinner ? (
                <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white">
                  <RiTrophyLine className="size-3" aria-hidden />
                </span>
              ) : null}
            </div>
            <p className="line-clamp-2 text-xs font-medium">{nominee.name}</p>
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {nominee.voteCount} votes
            </p>
          </article>
        );
      })}
    </div>
  );
}

export function CategoryActionButtons({
  run,
  category,
}: {
  run: CampaignRunState;
  category: MockCategory;
}) {
  const lockedWinner = category.winnerNomineeId
    ? getNominee(category, category.winnerNomineeId)
    : undefined;

  return (
    <div className="mt-4 space-y-3">
      {category.status === "voting_closed" && lockedWinner ? (
        <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Locked winner (not public yet)
          </p>
          <p className="font-medium">{lockedWinner.name}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {category.status === "voting_open" ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => run.closeCategoryVoting(category.id)}
          >
            <RiStopCircleLine />
            Close voting
          </Button>
        ) : null}
        {category.status === "voting_closed" ? (
          <Button
            type="button"
            onClick={() => run.revealCategoryWinner(category.id)}
          >
            <RiTrophyLine />
            Show winner
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm">
          <RiExternalLinkLine />
          Preview public
        </Button>
      </div>
    </div>
  );
}

export function FocusCategoryPanel({
  run,
  category,
}: {
  run: CampaignRunState;
  category: MockCategory;
}) {
  const winner =
    category.winnerNomineeId && category.status === "winner_revealed"
      ? getNominee(category, category.winnerNomineeId)
      : undefined;
  const index = run.sorted.findIndex((c) => c.id === category.id) + 1;
  const isCloseHead = run.closeVoteHead?.id === category.id;
  const isRevealHead = run.revealHead?.id === category.id;

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Category {index} of {run.totalCount}
            {isCloseHead ? " · Next to close voting" : ""}
            {isRevealHead ? " · Next to show winner" : ""}
          </p>
          <h2 className="text-lg font-semibold">{category.name}</h2>
        </div>
        <Badge variant="outline">{categoryStatusLabel(category.status)}</Badge>
      </div>

      {winner ? (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-3">
          <RiTrophyLine className="size-6 text-amber-600" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Winner (public)
            </p>
            <p className="font-semibold">{winner.name}</p>
          </div>
        </div>
      ) : null}

      <NomineeStrip
        category={category}
        showWinner={category.status === "winner_revealed"}
      />

      <CategoryActionButtons run={run} category={category} />
    </section>
  );
}

export function RunwayNavFooter({
  run,
  categoryId,
}: {
  run: CampaignRunState;
  categoryId: string;
}) {
  const index = run.sorted.findIndex((c) => c.id === categoryId);
  const prev = index > 0 ? run.sorted[index - 1] : null;
  const next = index < run.sorted.length - 1 ? run.sorted[index + 1] : null;

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!prev}
        onClick={() => prev && run.selectCategory(prev.id)}
      >
        <RiArrowLeftLine />
        Previous
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!next}
        onClick={() => next && run.selectCategory(next.id)}
      >
        Next
        <RiArrowRightLine />
      </Button>
    </div>
  );
}

export function OverviewCategoryRow({
  run,
  category,
  index,
}: {
  run: CampaignRunState;
  category: MockCategory;
  index: number;
}) {
  const publicWinner =
    category.status === "winner_revealed" && category.winnerNomineeId
      ? getNominee(category, category.winnerNomineeId)
      : undefined;
  const lockedWinner =
    category.status === "voting_closed" && category.winnerNomineeId
      ? getNominee(category, category.winnerNomineeId)
      : undefined;

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="text-xs tabular-nums text-muted-foreground">
          {index + 1}
        </span>
        <h3 className="font-semibold">{category.name}</h3>
        <Badge variant="outline">{categoryStatusLabel(category.status)}</Badge>
        {run.closeVoteHead?.id === category.id ? (
          <Badge className="bg-primary/15 text-primary">Close-vote head</Badge>
        ) : null}
        {run.revealHead?.id === category.id ? (
          <Badge className="bg-amber-500/15 text-amber-900 dark:text-amber-100">
            Reveal head
          </Badge>
        ) : null}
      </div>
      {publicWinner ? (
        <p className="mb-2 text-sm">
          Public winner:{" "}
          <span className="font-medium">{publicWinner.name}</span>
        </p>
      ) : null}
      {lockedWinner ? (
        <p className="mb-2 text-sm text-muted-foreground">
          Locked:{" "}
          <span className="font-medium text-foreground">
            {lockedWinner.name}
          </span>
        </p>
      ) : null}
      <NomineeStrip
        category={category}
        showWinner={category.status === "winner_revealed"}
      />
      <CategoryActionButtons run={run} category={category} />
    </li>
  );
}
