"use client";

import type { Id } from "@cvx/_generated/dataModel";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
} from "@remixicon/react";
import Link from "next/link";
import { CampaignNotFound } from "@/components/public/campaign-not-found";
import { EntityImage } from "@/components/public/entity-image";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  publicCampaignPath,
  publicCategoriesPath,
  publicCategoryPath,
} from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";
import { CategoryFlowNav } from "./category-flow-nav";
import { PageGate, VariantFrame } from "./page-states";
import { useCampaignPage } from "./use-campaign-page";
import { useCategoryPage } from "./use-category-page";
import { VoteProgress } from "./vote-progress";

function statusLabel(votingOpen: boolean, lifecycle: string) {
  if (votingOpen) return "Voting open";
  if (lifecycle === "finished") return "Voting closed";
  return "View only";
}

export function ClassicCampaignPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame>
          <article className="flex flex-col gap-8">
            <header className="flex flex-col gap-4">
              <EntityImage
                imageUrl={campaign.imageUrl}
                label={campaign.name}
                aspect={16 / 9}
                className="w-full rounded-lg"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {statusLabel(campaign.votingOpen, campaign.lifecycle)}
                </Badge>
              </div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="max-w-2xl text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}
              {totalCategories > 0 ? (
                <VoteProgress voted={votedCount} total={totalCategories} />
              ) : null}
              {campaign.votingOpen && !campaign.canVote ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Sign in to cast your votes.
                </p>
              ) : null}
              {totalCategories > 0 ? (
                <Link
                  href={publicCategoriesPath(
                    campaign.slug,
                    campaign.workspaceId,
                    layout,
                  )}
                  className={buttonVariants({ size: "lg", className: "w-fit" })}
                >
                  {campaign.votingOpen ? "Start voting" : "Browse categories"}
                  <RiArrowRightLine className="size-4" />
                </Link>
              ) : null}
            </header>
          </article>
        </VariantFrame>
      ) : (
        <CampaignNotFound />
      )}
    </PageGate>
  );
}

export function ClassicCategoriesPage({ slug }: { slug: string }) {
  const { campaign, layout, votedCount, totalCategories } =
    useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame>
          <div className="flex flex-col gap-6">
            <Link
              href={publicCampaignPath(
                campaign.slug,
                campaign.workspaceId,
                layout,
              )}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-fit gap-1.5 px-0",
              )}
            >
              <RiArrowLeftLine className="size-4" />
              {campaign.name}
            </Link>
            <header className="flex flex-col gap-3">
              <h1 className="font-heading text-2xl font-semibold md:text-3xl">
                Categories
              </h1>
              <VoteProgress voted={votedCount} total={totalCategories} />
            </header>
            {campaign.categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories published yet.
              </p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {campaign.categories.map((category) => (
                  <li key={category._id}>
                    <Link
                      href={publicCategoryPath(
                        campaign.slug,
                        campaign.workspaceId,
                        category._id,
                        layout,
                      )}
                      className={cn(
                        "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors",
                        "hover:border-foreground/25 hover:bg-muted/30",
                      )}
                    >
                      <EntityImage
                        imageUrl={category.imageUrl}
                        label={category.name}
                        aspect={4 / 3}
                        className="w-full border-0 border-b border-border"
                      />
                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <h2 className="font-heading font-medium leading-snug">
                          {category.name}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {category.nomineeCount} nominee
                          {category.nomineeCount === 1 ? "" : "s"}
                        </p>
                        {category.selectedNomineeId ? (
                          <p className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
                            <RiCheckLine className="size-3.5" />
                            Vote recorded
                          </p>
                        ) : campaign.votingOpen ? (
                          <p className="text-xs text-muted-foreground">
                            Tap to vote
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </VariantFrame>
      ) : (
        <CampaignNotFound />
      )}
    </PageGate>
  );
}

export function ClassicCategoryPage({
  slug,
  categoryId,
}: {
  slug: string;
  categoryId: Id<"campaignCategories">;
}) {
  const { data, layout, vote, adjacency } = useCategoryPage(slug, categoryId);

  return (
    <PageGate
      loading={data === undefined}
      notFound={data === null}
      loadingFallback={undefined}
    >
      {data ? (
        <VariantFrame>
          <div className="flex flex-col gap-6">
            <Link
              href={publicCategoriesPath(
                data.campaign.slug,
                data.campaign.workspaceId,
                layout,
              )}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-fit gap-1.5 px-0",
              )}
            >
              <RiArrowLeftLine className="size-4" />
              All categories
            </Link>
            <header className="flex flex-col gap-3">
              <Badge variant="secondary">
                {data.votingOpen ? "Voting open" : "Voting closed"}
              </Badge>
              <h1 className="font-heading text-2xl font-semibold md:text-3xl">
                {data.category.name}
              </h1>
              {data.votingOpen && vote.clerkLoaded && !vote.isSignedIn ? (
                <Link
                  href={vote.signInHref}
                  className={buttonVariants({ size: "sm", className: "w-fit" })}
                >
                  Sign in to vote
                </Link>
              ) : null}
            </header>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.nominees.map((nominee) => {
                const isSelected = vote.activeSelection === nominee._id;
                return (
                  <li key={nominee._id}>
                    <button
                      type="button"
                      disabled={!vote.canSelect || vote.voteInFlight}
                      onClick={() => void vote.handleVote(nominee._id)}
                      className={cn(
                        "flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors",
                        isSelected
                          ? "border-emerald-600 ring-2 ring-emerald-600/30"
                          : "border-border hover:border-foreground/25",
                      )}
                    >
                      <EntityImage
                        imageUrl={nominee.imageUrl}
                        label={nominee.name}
                        aspect={1}
                        className="w-full border-0 border-b border-border"
                      />
                      <div className="flex items-center justify-between gap-2 p-4">
                        <span className="font-medium">{nominee.name}</span>
                        {isSelected ? (
                          <RiCheckLine className="size-5 text-emerald-600" />
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
              />
            ) : null}
          </div>
        </VariantFrame>
      ) : (
        <CampaignNotFound />
      )}
    </PageGate>
  );
}
