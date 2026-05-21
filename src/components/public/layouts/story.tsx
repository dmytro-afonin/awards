"use client";

import { StoryBoxyCampaignPage } from "@/components/public/layouts/story-boxy/campaign-page";
import { StoryCategoriesGrid } from "@/components/public/layouts/story-boxy/categories-grid";
import { StoryBoxyNomineesPage } from "@/components/public/layouts/story-boxy/nominees-page";
import { StoryVoteGrid } from "@/components/public/layouts/story-boxy/vote-grid";
import { CategoryFlowNav } from "./category-flow-nav";
import { PageGate, VariantFrame } from "./page-states";
import { useCampaignPage } from "./use-campaign-page";
import { useCategoryPage } from "./use-category-page";
import { BackToCategories, SignInToVote } from "./variant-shell";

export function StoryCampaignPage({ slug }: { slug: string }) {
  return <StoryBoxyCampaignPage slug={slug} />;
}

export function StoryCategoriesPage({ slug }: { slug: string }) {
  const { campaign } = useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide>
          <header className="mb-5 border-b border-zinc-800 pb-4">
            <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Pick a category to cast your vote
            </p>
          </header>
          <StoryCategoriesGrid campaign={campaign} />
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function StoryCategoryPage({
  slug,
  categorySlug,
}: {
  slug: string;
  categorySlug: string;
}) {
  const { data, vote, adjacency } = useCategoryPage(slug, categorySlug);

  return (
    <PageGate loading={data === undefined} notFound={data === null}>
      {data ? (
        <VariantFrame wide>
          <BackToCategories campaign={data.campaign} className="mb-4" />
          <header className="mb-5">
            <p className="font-mono text-xs text-amber-500/90">
              {adjacency.index + 1} / {adjacency.total}
            </p>
            <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">
              {data.category.name}
            </h1>
            <SignInToVote vote={vote} className="mt-3 rounded-none" />
          </header>

          <StoryVoteGrid data={data} vote={vote} />

          {adjacency.campaign ? (
            <CategoryFlowNav
              slug={data.campaign.slug}
              workspaceId={data.campaign.workspaceId}
              index={adjacency.index}
              total={adjacency.total}
              prev={adjacency.prev}
              next={adjacency.next}
              activeSelection={vote.activeSelection}
              votingOpen={data.votingOpen}
              categoryStatus={data.category.categoryStatus}
              className="mt-8"
            />
          ) : null}
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}

export function StoryNomineesPage({ slug }: { slug: string }) {
  return <StoryBoxyNomineesPage slug={slug} />;
}
