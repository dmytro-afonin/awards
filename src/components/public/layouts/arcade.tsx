"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiCheckLine, RiGamepadLine } from "@remixicon/react";
import Link from "next/link";
import { EntityImage } from "@/components/public/entity-image";
import {
  publicCategoriesPath,
  publicCategoryPath,
} from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";
import { CategoryFlowNav } from "./category-flow-nav";
import { PageGate, VariantFrame } from "./page-states";
import { useCampaignPage } from "./use-campaign-page";
import { useCategoryPage } from "./use-category-page";
import {
  BackToCampaign,
  BackToCategories,
  SignInToVote,
  StartVotingLink,
} from "./variant-shell";
import { VoteProgress } from "./vote-progress";

const frame =
  "rounded-none border-2 border-cyan-400/60 bg-zinc-950 text-zinc-100 shadow-[4px_4px_0_0] shadow-cyan-500/40";

export function ArcadeCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="bg-zinc-950 text-zinc-100">
          <div className={cn(frame, "p-6 md:p-10")}>
            <div className="flex items-center gap-2 font-mono text-xs text-cyan-300">
              <RiGamepadLine className="size-4" />
              PLAYER 1 · READY
            </div>
            <h1 className="mt-4 font-mono text-3xl font-bold uppercase tracking-tight text-fuchsia-300 md:text-5xl">
              {campaign.name}
            </h1>
            {campaign.description ? (
              <p className="mt-4 max-w-xl text-sm text-zinc-400">
                {campaign.description}
              </p>
            ) : null}
            {totalCategories > 0 ? (
              <div className="mt-6">
                <p className="font-mono text-xs text-cyan-300">PROGRESS</p>
                <VoteProgress
                  voted={votedCount}
                  total={totalCategories}
                  barClassName="bg-fuchsia-500"
                />
              </div>
            ) : null}
            <StartVotingLink
              href={publicCategoriesPath(
                campaign.slug,
                campaign.workspaceId,
                layout,
              )}
              votingOpen={campaign.votingOpen}
              className="mt-8 rounded-none border-2 border-fuchsia-400 bg-fuchsia-600 font-mono uppercase hover:bg-fuchsia-500"
            >
              Insert coin → Vote
            </StartVotingLink>
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function ArcadeCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="bg-zinc-950 text-zinc-100">
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="mb-4 text-cyan-300"
          />
          <div className={cn(frame, "mb-6 p-4")}>
            <h1 className="font-mono text-2xl font-bold uppercase text-cyan-300">
              Select stage
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mt-3"
              barClassName="bg-cyan-400"
            />
          </div>
          <ul className="flex flex-col gap-3">
            {campaign.categories.map((cat, i) => (
              <li key={cat._id}>
                <Link
                  href={publicCategoryPath(
                    campaign.slug,
                    campaign.workspaceId,
                    cat._id,
                    layout,
                  )}
                  className={cn(
                    frame,
                    "flex items-center gap-4 p-4 transition-transform hover:translate-x-1",
                    cat.selectedNomineeId &&
                      "border-emerald-400 shadow-emerald-500/30",
                  )}
                >
                  <span className="font-mono text-2xl text-fuchsia-400">
                    LV{i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-mono font-bold uppercase">{cat.name}</p>
                    <p className="text-xs text-zinc-500">
                      {cat.nomineeCount} targets
                    </p>
                  </div>
                  {cat.selectedNomineeId ? (
                    <RiCheckLine className="size-6 text-emerald-400" />
                  ) : (
                    <span className="font-mono text-xs text-cyan-400">
                      GO →
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function ArcadeCategoryPage({
  slug,
  categoryId,
}: {
  slug: string;
  categoryId: Id<"campaignCategories">;
}) {
  const { data, layout, vote, adjacency } = useCategoryPage(slug, categoryId);

  return (
    <PageGate loading={data === undefined} notFound={data === null}>
      {data ? (
        <VariantFrame className="bg-zinc-950 text-zinc-100">
          <BackToCategories
            campaign={data.campaign}
            layout={layout}
            className="text-cyan-300"
          />
          <div className={cn(frame, "my-6 p-4")}>
            <p className="font-mono text-xs text-fuchsia-400">
              STAGE {adjacency.index + 1}/{adjacency.total}
            </p>
            <h1 className="font-mono text-2xl font-bold uppercase text-cyan-300">
              {data.category.name}
            </h1>
            <SignInToVote
              vote={vote}
              className="mt-3 rounded-none border-cyan-400"
            />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      frame,
                      "w-full overflow-hidden text-left transition-transform active:scale-[0.98]",
                      selected &&
                        "border-emerald-400 ring-2 ring-emerald-400/50",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={16 / 10}
                      className="border-0 border-b-2 border-cyan-400/40"
                    />
                    <div className="flex items-center justify-between p-3 font-mono font-bold uppercase">
                      {nominee.name}
                      {selected ? (
                        <RiCheckLine className="text-emerald-400" />
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {adjacency.campaign ? (
            <CategoryFlowNav
              slug={data.campaign.slug}
              workspaceId={data.campaign.workspaceId}
              layout={layout}
              index={adjacency.index}
              total={adjacency.total}
              prev={adjacency.prev}
              next={adjacency.next}
              activeSelection={vote.activeSelection}
              className="mt-8 border-cyan-400/30"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
