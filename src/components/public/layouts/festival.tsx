"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiCheckLine, RiSparklingLine } from "@remixicon/react";
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

export function FestivalCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="overflow-hidden">
          <div className="relative -mx-4 -mt-8 rounded-b-[2.5rem] bg-gradient-to-br from-orange-400 via-rose-500 to-violet-600 px-4 pb-12 pt-16 text-white md:-mx-6 md:px-8 md:pt-20">
            <RiSparklingLine
              className="absolute right-6 top-8 size-10 rotate-12 opacity-40"
              aria-hidden
            />
            <div className="absolute -left-8 top-24 size-32 rounded-full bg-yellow-300/30 blur-2xl" />
            <h1 className="relative max-w-xl font-heading text-4xl font-bold leading-tight md:text-5xl">
              {campaign.name}
            </h1>
            {campaign.description ? (
              <p className="relative mt-4 max-w-lg text-white/90">
                {campaign.description}
              </p>
            ) : null}
            {totalCategories > 0 ? (
              <VoteProgress
                voted={votedCount}
                total={totalCategories}
                className="relative mt-6 max-w-sm"
                barClassName="bg-yellow-300"
              />
            ) : null}
            <StartVotingLink
              href={publicCategoriesPath(
                campaign.slug,
                campaign.workspaceId,
                layout,
              )}
              votingOpen={campaign.votingOpen}
              className="relative mt-8 rounded-full bg-white text-rose-600 hover:bg-white/95"
            >
              Join the party →
            </StartVotingLink>
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function FestivalCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame>
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="text-rose-600"
          />
          <header className="my-6">
            <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-orange-500 to-violet-600 bg-clip-text text-transparent">
              Pick your favorites
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mt-4 max-w-sm"
              barClassName="bg-gradient-to-r from-orange-400 to-rose-500"
            />
          </header>
          <ul className="grid gap-4 sm:grid-cols-2">
            {campaign.categories.map((cat) => (
              <li key={cat._id}>
                <Link
                  href={publicCategoryPath(
                    campaign.slug,
                    campaign.workspaceId,
                    cat._id,
                    layout,
                  )}
                  className={cn(
                    "group relative block overflow-hidden rounded-2xl border-2 border-transparent bg-gradient-to-br from-orange-100 to-rose-100 p-1 transition hover:scale-[1.02] dark:from-orange-950/40 dark:to-rose-950/40",
                    cat.selectedNomineeId && "border-emerald-400",
                  )}
                >
                  <div className="rounded-[calc(1rem-2px)] bg-card p-4">
                    <EntityImage
                      imageUrl={cat.imageUrl}
                      label={cat.name}
                      aspect={16 / 10}
                      className="mb-3 rounded-xl"
                    />
                    <h2 className="font-heading text-lg font-semibold group-hover:text-rose-600">
                      {cat.name}
                    </h2>
                    {cat.selectedNomineeId ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                        <RiCheckLine className="size-3.5" /> You voted!
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {cat.nomineeCount} nominees
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function FestivalCategoryPage({
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
        <VariantFrame>
          <BackToCategories
            campaign={data.campaign}
            layout={layout}
            className="text-rose-600"
          />
          <header className="my-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-violet-500/10 p-6">
            <p className="text-sm font-medium text-rose-600">
              Category {adjacency.index + 1} of {adjacency.total} ✨
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold">
              {data.category.name}
            </h1>
            <SignInToVote
              vote={vote}
              className="mt-4 rounded-full bg-rose-600"
            />
          </header>
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      "w-full overflow-hidden rounded-2xl text-left shadow-md transition hover:shadow-lg",
                      selected ? "ring-4 ring-emerald-400" : "ring-0",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={4 / 3}
                      className="rounded-none border-0"
                    />
                    <div className="flex items-center justify-between bg-card p-4">
                      <span className="font-semibold">{nominee.name}</span>
                      {selected ? (
                        <RiCheckLine className="size-5 text-emerald-500" />
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
              className="mt-8"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
