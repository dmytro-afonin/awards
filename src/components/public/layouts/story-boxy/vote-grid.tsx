"use client";

import { RiCheckLine, RiTrophyLine } from "@remixicon/react";
import {
  BoxyImage,
  ScanlineOverlay,
} from "@/components/public/layouts/story-boxy/shared";
import type { StoryVoteGridProps } from "@/components/public/layouts/story-boxy/vote-types";
import { cn } from "@/lib/utils";

/** Compact playful nominee tiles — winner highlighted in-grid only */
export function StoryVoteGrid({ data, vote }: StoryVoteGridProps) {
  const winnerRevealed = data.winner !== null;
  const votingClosedPending =
    data.category.categoryStatus === "voting_closed" && !winnerRevealed;

  return (
    <div className="space-y-4">
      {votingClosedPending ? (
        <p className="rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Voting is closed. The winner has not been announced yet.
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {data.nominees.map((nominee, index) => {
          const selected = vote.activeSelection === nominee._id;
          const isWinner = data.winner?._id === nominee._id;
          const playfulTilt =
            index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1";

          return (
            <li key={nominee._id} className="p-1">
              <button
                type="button"
                disabled={
                  !vote.canSelect || vote.voteInFlight || winnerRevealed
                }
                aria-pressed={Boolean(selected)}
                aria-label={
                  isWinner
                    ? `${nominee.name}, category winner`
                    : selected
                      ? `${nominee.name}, your vote`
                      : nominee.name
                }
                onClick={() => void vote.handleVote(nominee._id)}
                className={cn(
                  "group relative w-full rounded-md p-2 text-left transition-all duration-300",
                  !winnerRevealed &&
                    "hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(251,191,36,0.18)]",
                  !winnerRevealed && playfulTilt,
                  selected &&
                    !winnerRevealed &&
                    "bg-amber-500/10 ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950",
                  isWinner &&
                    "scale-[1.03] bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_12px_32px_rgba(16,185,129,0.22)] ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950",
                  winnerRevealed &&
                    !isWinner &&
                    "opacity-55 saturate-[0.8] hover:opacity-70",
                )}
              >
                {isWinner ? (
                  <span className="absolute -right-1 -top-1 z-10 inline-flex rotate-3 items-center gap-0.5 rounded-sm bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-950 shadow-md">
                    <RiTrophyLine className="size-3" aria-hidden />
                    Winner
                  </span>
                ) : (
                  <span className="absolute left-2 top-2 z-10 size-0 border-t-[18px] border-r-[18px] border-t-amber-500 border-r-transparent opacity-90 transition-transform group-hover:scale-110" />
                )}

                <BoxyImage
                  imageUrl={nominee.imageUrl}
                  label={nominee.name}
                  aspect={3 / 4}
                  className={cn(
                    "rounded-sm border-zinc-700/80",
                    isWinner && "border-emerald-400/60",
                    selected && !winnerRevealed && "border-amber-400/50",
                  )}
                >
                  <ScanlineOverlay />
                  <div className="absolute inset-x-0 bottom-0 rounded-b-sm bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent px-2.5 pb-2.5 pt-8">
                    <p className="line-clamp-2 font-heading text-sm font-bold leading-tight text-white">
                      {nominee.name}
                    </p>
                    {isWinner ? (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                        Winner
                      </p>
                    ) : selected ? (
                      <p className="mt-1 flex items-center gap-0.5 text-[10px] text-emerald-400">
                        <RiCheckLine className="size-3" /> Your vote
                      </p>
                    ) : !winnerRevealed ? (
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Tap to vote
                      </p>
                    ) : null}
                  </div>
                </BoxyImage>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
