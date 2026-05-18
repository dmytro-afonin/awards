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
  BackToCategories,
  SignInToVote,
  StartVotingLink,
} from "./variant-shell";

export function StoryCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout } = useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide className="max-w-none px-0 md:px-0">
          <section className="relative flex min-h-[70vh] flex-col justify-end">
            <EntityImage
              imageUrl={campaign.imageUrl}
              label={campaign.name}
              aspect={9 / 16}
              className="absolute inset-0 size-full !aspect-auto min-h-full border-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            <div className="relative px-4 pb-8 pt-32 md:px-8 md:pb-12">
              <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-3 max-w-lg text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}
              <StartVotingLink
                href={publicCategoriesPath(
                  campaign.slug,
                  campaign.workspaceId,
                  layout,
                )}
                votingOpen={campaign.votingOpen}
                className="mt-6 rounded-full"
              >
                Swipe through categories →
              </StartVotingLink>
            </div>
          </section>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function StoryCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout } = useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide className="max-w-none">
          <p className="mb-4 text-sm text-muted-foreground">
            Swipe horizontally · tap to open
          </p>
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:-mx-6 md:px-6">
            {campaign.categories.map((cat, i) => (
              <Link
                key={cat._id}
                href={publicCategoryPath(
                  campaign.slug,
                  campaign.workspaceId,
                  cat._id,
                  layout,
                )}
                className="relative w-[min(85vw,320px)] shrink-0 snap-center"
              >
                <EntityImage
                  imageUrl={cat.imageUrl}
                  label={cat.name}
                  aspect={9 / 14}
                  className="rounded-2xl shadow-lg"
                />
                <div className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                  <span className="text-xs opacity-80">
                    {i + 1} / {campaign.categories.length}
                  </span>
                  <p className="font-heading text-xl font-semibold">
                    {cat.name}
                  </p>
                  {cat.selectedNomineeId ? (
                    <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300">
                      <RiCheckLine className="size-3.5" /> Voted
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function StoryCategoryPage({
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
        <VariantFrame wide className="max-w-none px-0 md:px-0">
          <BackToCategories
            campaign={data.campaign}
            layout={layout}
            className="mx-4 mb-2 md:mx-8"
          />
          <header className="px-4 md:px-8">
            <p className="text-sm text-muted-foreground">
              Story {adjacency.index + 1} of {adjacency.total}
            </p>
            <h1 className="font-heading text-3xl font-bold">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mt-3 rounded-full" />
          </header>
          <ul className="mt-6 flex flex-col gap-1">
            {data.nominees.map((nominee) => {
              const selected = vote.activeSelection === nominee._id;
              return (
                <li key={nominee._id}>
                  <button
                    type="button"
                    disabled={!vote.canSelect || vote.voteInFlight}
                    onClick={() => void vote.handleVote(nominee._id)}
                    className={cn(
                      "relative flex min-h-[42vh] w-full flex-col justify-end overflow-hidden text-left md:min-h-[50vh]",
                      selected && "ring-4 ring-inset ring-emerald-500",
                    )}
                  >
                    <EntityImage
                      imageUrl={nominee.imageUrl}
                      label={nominee.name}
                      aspect={9 / 16}
                      className="absolute inset-0 size-full !aspect-auto min-h-full border-0"
                    />
                    <div className="relative bg-gradient-to-t from-black/90 via-black/40 to-transparent px-6 pb-8 pt-24">
                      <p className="text-2xl font-bold text-white md:text-3xl">
                        {nominee.name}
                      </p>
                      {selected ? (
                        <p className="mt-2 flex items-center gap-2 text-sm text-emerald-300">
                          <RiCheckLine /> Your pick
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-white/70">
                          Tap to vote
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          {adjacency.campaign ? (
            <div className="px-4 md:px-8">
              <CategoryFlowNav
                slug={data.campaign.slug}
                workspaceId={data.campaign.workspaceId}
                layout={layout}
                index={adjacency.index}
                total={adjacency.total}
                prev={adjacency.prev}
                next={adjacency.next}
                activeSelection={vote.activeSelection}
                className="mt-6"
              />
            </div>
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
