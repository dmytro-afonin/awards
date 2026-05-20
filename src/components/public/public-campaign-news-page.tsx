"use client";

import {
  PageGate,
  VariantFrame,
} from "@/components/public/layouts/page-states";
import { useCampaignPage } from "@/components/public/layouts/use-campaign-page";

export function PublicCampaignNewsPage({ slug }: { slug: string }) {
  const { campaign } = useCampaignPage(slug);

  return (
    <PageGate loading={campaign === undefined} notFound={campaign === null}>
      {campaign ? (
        <VariantFrame wide>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-500">
            {campaign.name}
          </p>
          <h1 className="mt-3 font-heading text-2xl font-bold uppercase tracking-tight text-white">
            Campaign news
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
            Updates and announcements for this campaign will be published here.
          </p>
        </VariantFrame>
      ) : null}
    </PageGate>
  );
}
