"use client";

import { api } from "@cvx/_generated/api";
import { RiTrophyLine } from "@remixicon/react";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useSearchParams } from "next/navigation";
import {
  PageGate,
  VariantFrame,
} from "@/components/public/layouts/page-states";
import {
  BoxyImage,
  ScanlineOverlay,
} from "@/components/public/layouts/story-boxy/shared";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

type NomineesPayload = NonNullable<
  FunctionReturnType<typeof api.publicCampaigns.listAllNominees>
>;

type NomineeRow = NomineesPayload["nominees"][number];

/** Compact playful nominee directory — same tile language as the vote grid */
export function StoryBoxyNomineesPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
  const payload = useQuery(api.publicCampaigns.listAllNominees, {
    slug,
    workspaceId,
  });

  return (
    <PageGate loading={payload === undefined} notFound={payload === null}>
      {payload ? (
        <VariantFrame wide>
          <header className="mb-4 border-l-2 border-amber-500 pl-3">
            <h1 className="font-heading text-xl font-bold uppercase tracking-tight text-white md:text-2xl">
              Nominees
            </h1>
            <p className="mt-1 max-w-lg text-xs text-zinc-500">
              Everyone in the running for {payload.campaign.name}.
            </p>
          </header>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {payload.nominees.map((nominee: NomineeRow, index: number) => (
              <NomineeTile key={nominee._id} nominee={nominee} index={index} />
            ))}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

function NomineeTile({
  nominee,
  index,
}: {
  nominee: NomineeRow;
  index: number;
}) {
  const playfulTilt = index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1";

  return (
    <li className="p-1">
      <article
        className={cn(
          "group relative rounded-md p-2 transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(251,191,36,0.18)]",
          playfulTilt,
          nominee.isWinner &&
            "scale-[1.03] bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_12px_32px_rgba(16,185,129,0.22)] ring-2 ring-emerald-400 ring-offset-2 ring-offset-zinc-950",
        )}
      >
        {nominee.isWinner ? (
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
            nominee.isWinner && "border-emerald-400/60",
          )}
        >
          <ScanlineOverlay />
          <div className="absolute inset-x-0 bottom-0 rounded-b-sm bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent px-2.5 pb-2.5 pt-8">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-amber-500/90">
              {nominee.categoryName}
            </p>
            <p className="mt-0.5 line-clamp-2 font-heading text-sm font-bold leading-tight text-white">
              {nominee.name}
            </p>
            {nominee.isWinner ? (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
                Winner
              </p>
            ) : (
              <p className="mt-1 font-mono text-[10px] tabular-nums text-zinc-500">
                {nominee.voteCount} vote{nominee.voteCount === 1 ? "" : "s"}
              </p>
            )}
          </div>
        </BoxyImage>
      </article>
    </li>
  );
}
