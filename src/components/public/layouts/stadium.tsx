"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiCheckLine, RiTrophyLine } from "@remixicon/react";
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

const board =
  "rounded-lg border border-emerald-500/30 bg-emerald-950/90 text-emerald-50";

export function StadiumCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="max-w-none bg-zinc-900 px-0 text-zinc-100 md:px-0">
          <div className="border-b border-emerald-500/20 bg-gradient-to-b from-emerald-950 to-zinc-900 px-4 py-10 md:px-8 md:py-14">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-400">
                  <RiTrophyLine /> Live broadcast
                </p>
                <h1 className="mt-2 font-heading text-4xl font-bold uppercase md:text-5xl">
                  {campaign.name}
                </h1>
                {campaign.description ? (
                  <p className="mt-3 max-w-xl text-sm text-zinc-400">
                    {campaign.description}
                  </p>
                ) : null}
              </div>
              <div
                className={cn(
                  board,
                  "p-4 font-mono text-center md:min-w-[12rem]",
                )}
              >
                <p className="text-[10px] uppercase text-emerald-400/80">
                  Ballot
                </p>
                <p className="text-3xl font-bold tabular-nums">
                  {votedCount}/{totalCategories}
                </p>
                <p className="text-xs text-emerald-200/70">categories picked</p>
              </div>
            </div>
            <StartVotingLink
              href={publicCategoriesPath(
                campaign.slug,
                campaign.workspaceId,
                layout,
              )}
              votingOpen={campaign.votingOpen}
              className="mx-auto mt-8 flex w-fit rounded-md bg-emerald-600 font-mono uppercase hover:bg-emerald-500"
            >
              Enter arena
            </StartVotingLink>
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function StadiumCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="bg-zinc-900 text-zinc-100">
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="text-emerald-400"
          />
          <header className={cn(board, "my-6 p-4")}>
            <h1 className="font-mono text-xl font-bold uppercase">
              Match lineup
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mt-3"
              barClassName="bg-emerald-400"
            />
          </header>
          <ul className="flex flex-col gap-2">
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
                    "flex items-center gap-4 border border-zinc-700 bg-zinc-800/80 p-3 transition hover:border-emerald-500/50 md:p-4",
                    cat.selectedNomineeId && "border-emerald-500/60",
                  )}
                >
                  <span className="w-8 font-mono text-lg text-emerald-400">
                    {i + 1}
                  </span>
                  <EntityImage
                    imageUrl={cat.imageUrl}
                    label={cat.name}
                    aspect={1}
                    className="size-12 shrink-0 md:size-14"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold uppercase">
                      {cat.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {cat.nomineeCount} contenders
                    </p>
                  </div>
                  {cat.selectedNomineeId ? (
                    <RiCheckLine className="size-5 text-emerald-400" />
                  ) : (
                    <span className="font-mono text-xs text-emerald-400">
                      VS
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

export function StadiumCategoryPage({
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
        <VariantFrame className="bg-zinc-900 text-zinc-100">
          <BackToCategories
            campaign={data.campaign}
            layout={layout}
            className="text-emerald-400"
          />
          <header className={cn(board, "my-6 p-4 text-center md:text-left")}>
            <p className="font-mono text-xs text-emerald-400">
              ROUND {adjacency.index + 1}
            </p>
            <h1 className="font-heading text-3xl font-bold uppercase">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mt-3 bg-emerald-600" />
          </header>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      "w-full overflow-hidden border-2 text-left transition",
                      selected
                        ? "border-emerald-400 bg-emerald-950/50"
                        : "border-zinc-700 bg-zinc-800 hover:border-emerald-500/40",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={4 / 3}
                      className="border-0"
                    />
                    <div className="flex items-center justify-between p-3 font-semibold uppercase">
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
              className="mt-8 border-zinc-700"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
