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

const card =
  "rounded-3xl bg-stone-100/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800";

export function ZenCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="bg-stone-50 dark:bg-stone-950">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-8 py-8 text-center md:py-16">
            <EntityImage
              imageUrl={campaign.imageUrl}
              label={campaign.name}
              aspect={1}
              className="w-48 rounded-full md:w-56"
            />
            <div>
              <h1 className="font-heading text-3xl font-medium tracking-tight text-stone-800 dark:text-stone-100 md:text-4xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-4 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {campaign.description}
                </p>
              ) : null}
            </div>
            {totalCategories > 0 ? (
              <VoteProgress
                voted={votedCount}
                total={totalCategories}
                className="w-full max-w-xs"
                barClassName="bg-stone-600 dark:bg-stone-400"
              />
            ) : null}
            <StartVotingLink
              href={publicCategoriesPath(
                campaign.slug,
                campaign.workspaceId,
                layout,
              )}
              votingOpen={campaign.votingOpen}
              className="rounded-full bg-stone-800 px-8 hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-900"
            >
              {campaign.votingOpen ? "Begin ballot" : "View categories"}
            </StartVotingLink>
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function ZenCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame className="bg-stone-50 dark:bg-stone-950">
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="mb-8 text-stone-600"
          />
          <header className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-medium text-stone-800 dark:text-stone-100">
              Your path
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mx-auto mt-4 max-w-xs"
            />
          </header>
          <ul className="mx-auto flex max-w-md flex-col gap-3">
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
                    card,
                    "flex items-center gap-4 p-4 transition hover:shadow-md",
                  )}
                >
                  <EntityImage
                    imageUrl={cat.imageUrl}
                    label={cat.name}
                    aspect={1}
                    className="size-14 shrink-0 rounded-2xl"
                  />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-medium text-stone-800 dark:text-stone-100">
                      {cat.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {cat.selectedNomineeId ? "Complete" : "Awaiting"}
                    </p>
                  </div>
                  {cat.selectedNomineeId ? (
                    <RiCheckLine className="size-5 text-stone-600" />
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function ZenCategoryPage({
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
        <VariantFrame className="bg-stone-50 dark:bg-stone-950">
          <BackToCategories
            campaign={data.campaign}
            layout={layout}
            className="text-stone-600"
          />
          <header className="my-8 text-center">
            <p className="text-xs text-stone-500">
              {adjacency.index + 1} of {adjacency.total}
            </p>
            <h1 className="mt-2 font-heading text-2xl font-medium">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mx-auto mt-4 rounded-full" />
          </header>
          <ul className="mx-auto flex max-w-md flex-col gap-4">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      card,
                      "w-full overflow-hidden text-left transition",
                      selected && "ring-2 ring-stone-500/50",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={16 / 10}
                      className="rounded-none border-0"
                    />
                    <div className="flex items-center justify-between p-4">
                      <span className="font-medium">{nominee.name}</span>
                      {selected ? (
                        <RiCheckLine className="text-stone-600" />
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
              className="mx-auto mt-10 max-w-md border-stone-200"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
