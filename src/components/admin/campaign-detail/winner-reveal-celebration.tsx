"use client";

import { RiTrophyLine } from "@remixicon/react";
import { cn } from "@/lib/utils";

export function WinnerRevealCelebration({
  winnerName,
  voteCount,
  className,
}: {
  winnerName: string;
  voteCount: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-transparent px-4 py-5",
        "animate-winner-reveal",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-amber-400/25 blur-2xl animate-winner-glow"
        aria-hidden
      />
      <div className="relative flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-lg animate-winner-trophy">
          <RiTrophyLine className="size-7" aria-hidden />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-amber-900/80 dark:text-amber-100/90">
            Winner revealed
          </p>
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {winnerName}
          </p>
          <p className="text-sm tabular-nums text-muted-foreground">
            {voteCount} {voteCount === 1 ? "vote" : "votes"}
          </p>
        </div>
      </div>
    </div>
  );
}
