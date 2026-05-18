"use client";

import type { Id } from "@cvx/_generated/dataModel";
import { RiCheckLine } from "@remixicon/react";
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

export function EditorialCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide className="max-w-none px-0 md:px-0">
          <div className="relative min-h-[55vh] w-full overflow-hidden md:min-h-[65vh]">
            <EntityImage
              imageUrl={campaign.imageUrl}
              label={campaign.name}
              aspect={16 / 9}
              className="absolute inset-0 size-full border-0 !aspect-auto min-h-full [&>div]:min-h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
            <div className="relative mx-auto flex min-h-[55vh] max-w-5xl flex-col justify-end px-4 pb-10 pt-24 md:min-h-[65vh] md:px-8 md:pb-14">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
                Awards · {campaign.votingOpen ? "Live ballot" : "Archive"}
              </p>
              <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-[1.05] text-white md:text-6xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">
                  {campaign.description}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <StartVotingLink
                  href={publicCategoriesPath(
                    campaign.slug,
                    campaign.workspaceId,
                    layout,
                  )}
                  votingOpen={campaign.votingOpen}
                  className="rounded-none bg-white text-black hover:bg-white/90"
                />
                {totalCategories > 0 ? (
                  <span className="text-sm text-white/70">
                    {totalCategories} categories
                  </span>
                ) : null}
              </div>
            </div>
          </div>
          {totalCategories > 0 ? (
            <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
              <VoteProgress voted={votedCount} total={totalCategories} />
            </div>
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function EditorialCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide>
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="mb-6"
          />
          <header className="mb-10 border-b border-foreground pb-6">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Ballot
            </p>
            <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">
              Categories
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mt-6 max-w-md"
            />
          </header>
          <ol className="flex flex-col">
            {campaign.categories.map((cat, i) => (
              <li
                key={cat._id}
                className="border-b border-border py-6 first:pt-0"
              >
                <Link
                  href={publicCategoryPath(
                    campaign.slug,
                    campaign.workspaceId,
                    cat._id,
                    layout,
                  )}
                  className="group grid gap-4 md:grid-cols-[4rem_1fr_12rem] md:items-center md:gap-8"
                >
                  <span className="font-mono text-3xl text-muted-foreground/50 md:text-4xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="font-heading text-2xl font-medium transition-colors group-hover:text-primary md:text-3xl">
                      {cat.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {cat.nomineeCount} nominees
                      {cat.selectedNomineeId ? " · Voted" : ""}
                    </p>
                  </div>
                  <EntityImage
                    imageUrl={cat.imageUrl}
                    label={cat.name}
                    aspect={4 / 3}
                    className="hidden md:block"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function EditorialCategoryPage({
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
        <VariantFrame wide>
          <BackToCategories campaign={data.campaign} layout={layout} />
          <header className="my-8 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Category {adjacency.index + 1} of {adjacency.total}
            </p>
            <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mt-4" />
          </header>
          <ul className="flex flex-col gap-0 divide-y divide-border border-y border-border">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      "flex w-full flex-col gap-4 py-6 text-left transition-colors sm:flex-row sm:items-center",
                      selected ? "bg-emerald-500/10" : "hover:bg-muted/40",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={1}
                      className="w-full sm:w-40 shrink-0"
                    />
                    <span className="flex flex-1 items-center justify-between gap-4 px-2">
                      <span className="font-heading text-xl font-medium md:text-2xl">
                        {nominee.name}
                      </span>
                      {selected ? (
                        <RiCheckLine className="size-6 text-emerald-600" />
                      ) : (
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Select
                        </span>
                      )}
                    </span>
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
              className="mt-10"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
