"use client";

import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useSearchParams } from "next/navigation";
import {
  PageGate,
  VariantFrame,
} from "@/components/public/layouts/page-states";
import {
  BoxyImage,
  GrainOverlay,
} from "@/components/public/layouts/story-boxy/shared";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";

type NomineesPayload = NonNullable<
  FunctionReturnType<typeof api.publicCampaigns.listAllNominees>
>;

/** Flat nominee directory — rich cards, no category grouping */
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
          <header className="mb-6 border-l-4 border-amber-500 pl-4">
            <h1 className="font-heading text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
              Nominees
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Everyone in the running for {payload.campaign.name} —{" "}
              {payload.nominees.length} entries across all categories.
            </p>
          </header>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {payload.nominees.map(
              (nominee: NomineesPayload["nominees"][number], i: number) => (
                <li
                  key={nominee._id}
                  className="flex flex-col border border-zinc-800 bg-zinc-900/80 transition-colors hover:border-amber-500/40"
                >
                  <BoxyImage
                    imageUrl={nominee.imageUrl}
                    label={nominee.name}
                    aspect={5 / 4}
                    className="border-0 border-b border-zinc-800"
                    filterClassName="saturate-[1.05]"
                  >
                    <GrainOverlay />
                  </BoxyImage>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/90">
                      {nominee.categoryName}
                    </p>
                    <h2 className="font-heading text-lg font-bold leading-snug text-white">
                      {nominee.name}
                    </h2>
                    <dl className="mt-auto grid grid-cols-2 gap-2 border-t border-zinc-800 pt-3 text-xs">
                      <div>
                        <dt className="text-zinc-500">Votes</dt>
                        <dd className="font-mono text-base font-semibold tabular-nums text-amber-300">
                          {nominee.voteCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Entry</dt>
                        <dd className="font-mono tabular-nums text-zinc-300">
                          #{String(i + 1).padStart(2, "0")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </li>
              ),
            )}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
