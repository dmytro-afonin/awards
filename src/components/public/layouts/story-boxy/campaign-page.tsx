"use client";

import {
  PageGate,
  VariantFrame,
} from "@/components/public/layouts/page-states";
import { BoxyImage } from "@/components/public/layouts/story-boxy/shared";
import { useCampaignPage } from "@/components/public/layouts/use-campaign-page";
import { StartVotingLink } from "@/components/public/layouts/variant-shell";
import { publicCategoriesPath } from "@/lib/public-campaign-url";

/** Boxy story hero — structured blocks, not full-bleed rounds */
export function StoryBoxyCampaignPage({ slug }: { slug: string }) {
  const { campaign } = useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide className="max-w-6xl">
          <article className="grid gap-6 border border-amber-500/25 bg-zinc-900/50 md:grid-cols-[1.1fr_1fr]">
            <BoxyImage
              imageUrl={campaign.imageUrl}
              label={campaign.name}
              aspect={16 / 10}
              className="border-0 md:min-h-full"
              filterClassName="saturate-[1.08]"
            />
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-500">
                Awards
              </p>
              <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
                {campaign.name}
              </h1>
              {campaign.description ? (
                <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
                  {campaign.description}
                </p>
              ) : null}
              <StartVotingLink
                href={publicCategoriesPath(campaign.slug, campaign.workspaceId)}
                votingOpen={campaign.votingOpen}
                className="mt-6 rounded-none border-amber-500/50 uppercase tracking-wider"
              >
                Browse categories →
              </StartVotingLink>
            </div>
          </article>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
