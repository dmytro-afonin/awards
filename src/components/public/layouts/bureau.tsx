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

export function BureauCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame>
          <div className="grid gap-8 md:grid-cols-[1fr_2px_1fr] md:gap-12">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-red-600">
                Awards program
              </p>
              <h1 className="mt-4 font-heading text-4xl font-semibold uppercase leading-none md:text-6xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}
            </div>
            <div className="hidden bg-foreground md:block" />
            <div className="flex flex-col justify-end gap-6">
              <EntityImage
                imageUrl={campaign.imageUrl}
                label={campaign.name}
                aspect={4 / 5}
              />
              <VoteProgress
                voted={votedCount}
                total={totalCategories}
                barClassName="bg-red-600 rounded-none"
              />
              <StartVotingLink
                href={publicCategoriesPath(
                  campaign.slug,
                  campaign.workspaceId,
                  layout,
                )}
                votingOpen={campaign.votingOpen}
                className="w-full rounded-none uppercase tracking-wider"
              >
                Open ballot
              </StartVotingLink>
            </div>
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function BureauCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame>
          <BackToCampaign
            campaign={campaign}
            layout={layout}
            className="uppercase tracking-widest text-xs"
          />
          <header className="mt-6 border-l-4 border-red-600 pl-4">
            <h1 className="font-heading text-3xl font-semibold uppercase">
              Index
            </h1>
            <VoteProgress
              voted={votedCount}
              total={totalCategories}
              className="mt-4 max-w-xs"
              barClassName="bg-red-600 rounded-none"
            />
          </header>
          <ul className="mt-10 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
            {campaign.categories.map((cat) => (
              <li key={cat._id} className="bg-background">
                <Link
                  href={publicCategoryPath(
                    campaign.slug,
                    campaign.workspaceId,
                    cat._id,
                    layout,
                  )}
                  className="group flex h-full flex-col p-4 transition hover:bg-muted/50"
                >
                  <EntityImage
                    imageUrl={cat.imageUrl}
                    label={cat.name}
                    aspect={1}
                    className="mb-4 rounded-none"
                  />
                  <h2 className="text-sm font-semibold uppercase tracking-wide group-hover:text-red-600">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {cat.nomineeCount} entries ·{" "}
                    {cat.selectedNomineeId ? "Voted" : "Open"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function BureauCategoryPage({
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
            className="text-xs uppercase tracking-widest"
          />
          <header className="mt-6 border-b-2 border-foreground pb-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-red-600">
              §{adjacency.index + 1} — {adjacency.total}
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold uppercase md:text-4xl">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mt-4 rounded-none" />
          </header>
          <ul className="mt-8 divide-y divide-border">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      "grid w-full grid-cols-[4rem_1fr_auto] items-center gap-4 py-4 text-left sm:grid-cols-[6rem_1fr_auto]",
                      selected && "bg-red-50 dark:bg-red-950/20",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={1}
                      className="rounded-none"
                    />
                    <span className="font-medium uppercase tracking-wide">
                      {nominee.name}
                    </span>
                    {selected ? (
                      <RiCheckLine className="size-5 text-red-600" />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
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
