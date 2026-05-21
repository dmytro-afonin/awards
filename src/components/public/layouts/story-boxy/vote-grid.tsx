"use client";

import { RiCheckLine } from "@remixicon/react";
import {
  BoxyImage,
  ScanlineOverlay,
} from "@/components/public/layouts/story-boxy/shared";
import type { StoryVoteGridProps } from "@/components/public/layouts/story-boxy/vote-types";
import { cn } from "@/lib/utils";

/** Boxy vote grid — medium tiles, amber corner accent */
export function StoryVoteGrid({ data, vote }: StoryVoteGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {data.nominees.map((nominee) => {
        const selected = vote.activeSelection === nominee._id;
        return (
          <li key={nominee._id}>
            <button
              type="button"
              disabled={!vote.canSelect || vote.voteInFlight}
              aria-pressed={Boolean(selected)}
              onClick={() => void vote.handleVote(nominee._id)}
              className={cn(
                "group relative w-full text-left transition-transform hover:-translate-y-0.5",
                selected &&
                  "ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-950",
              )}
            >
              <span className="absolute left-0 top-0 z-10 size-0 border-t-[28px] border-r-[28px] border-t-amber-500 border-r-transparent" />
              <BoxyImage
                imageUrl={nominee.imageUrl}
                label={nominee.name}
                aspect={4 / 5}
              >
                <ScanlineOverlay />
                <div className="absolute inset-x-0 bottom-0 bg-zinc-950/90 p-3">
                  <p className="font-heading text-base font-bold text-white">
                    {nominee.name}
                  </p>
                  {selected ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-400">
                      <RiCheckLine className="size-3.5" /> Your vote
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-zinc-500">Tap to vote</p>
                  )}
                </div>
              </BoxyImage>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
