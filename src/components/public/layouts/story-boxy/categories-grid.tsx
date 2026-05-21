"use client";

import { RiTrophyLine } from "@remixicon/react";
import Link from "next/link";
import type { StoryCategoryGridProps } from "@/components/public/layouts/story-boxy/category-types";
import {
  BoxyImage,
  ScanlineOverlay,
  VotedBadge,
} from "@/components/public/layouts/story-boxy/shared";
import {
  CATEGORY_STATUS_PUBLIC_FRAME,
  categoryStatusLabel,
} from "@/lib/category-run";
import { publicCategoryPath } from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

/** Boxy category grid — sharp frames, scanlines, compact 3:4 tiles */
export function StoryCategoriesGrid({ campaign }: StoryCategoryGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {campaign.categories.map((cat, i) => (
        <li
          key={cat._id}
          className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <Link
            href={publicCategoryPath(
              campaign.slug,
              campaign.workspaceId,
              cat.slug,
            )}
            className="group block"
          >
            <BoxyImage
              imageUrl={cat.imageUrl}
              label={cat.name}
              aspect={3 / 4}
              className={cn(
                "transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_rgba(251,191,36,0.15)]",
                CATEGORY_STATUS_PUBLIC_FRAME[cat.categoryStatus],
                cat.categoryStatus === "open" &&
                  "group-hover:border-amber-400/60",
                cat.categoryStatus === "voting_closed" &&
                  "bg-amber-950/20 group-hover:border-amber-400/70",
                cat.categoryStatus === "finished" &&
                  "bg-emerald-950/20 group-hover:border-emerald-400/60",
              )}
            >
              <ScanlineOverlay />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent p-2.5 pt-10">
                <span className="font-mono text-[10px] text-amber-500/90">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="line-clamp-2 font-heading text-sm font-bold leading-tight text-white">
                  {cat.name}
                </p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400">
                  {categoryStatusLabel(cat.categoryStatus)}
                </p>
                {cat.winner ? (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <RiTrophyLine className="size-3" aria-hidden />
                    {cat.winner.name}
                  </p>
                ) : null}
                {cat.selectedNomineeId ? (
                  <VotedBadge className="mt-1.5" />
                ) : null}
              </div>
            </BoxyImage>
          </Link>
        </li>
      ))}
    </ul>
  );
}
