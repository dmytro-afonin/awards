"use client";

import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import Link from "next/link";
import {
  BoxyImage,
  ScanlineOverlay,
} from "@/components/public/layouts/story-boxy/shared";
import { getCampaignVisibilityConfig } from "@/lib/campaign-visibility";
import { publicCampaignPath } from "@/lib/public-campaign-url";
import { cn } from "@/lib/utils";

type DirectoryCampaign = FunctionReturnType<
  typeof api.publicCampaigns.listDirectory
>[number];

function lifecycleLabel(lifecycle: string): string {
  switch (lifecycle) {
    case "vote_live":
      return "Voting live";
    case "vote_ended":
      return "Voting ended";
    case "finished":
      return "Finished";
    case "launched":
      return "Launched";
    default:
      return lifecycle.replaceAll("_", " ");
  }
}

export function PublicCampaignsDirectory() {
  const campaigns = useQuery(api.publicCampaigns.listDirectory);

  if (campaigns === undefined) {
    return (
      <p className="text-sm text-zinc-500" aria-live="polite">
        Loading campaigns…
      </p>
    );
  }

  if (campaigns.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/40 px-4 py-8 text-center text-sm text-zinc-500">
        No campaigns are available yet. Public campaigns appear here for
        everyone; private campaigns show up when you are signed in and have
        access.
      </p>
    );
  }

  const publicCampaigns = campaigns.filter((c) => c.visibility === "public");
  const privateCampaigns = campaigns.filter((c) => c.visibility === "private");

  return (
    <div className="space-y-10">
      {publicCampaigns.length > 0 ? (
        <CampaignSection
          title="Public campaigns"
          description="Open to everyone. Sign in when voting is live to cast your vote."
          campaigns={publicCampaigns}
        />
      ) : null}

      {privateCampaigns.length > 0 ? (
        <CampaignSection
          title="Your private campaigns"
          description="These campaigns are only visible to workspace members like you."
          campaigns={privateCampaigns}
        />
      ) : null}
    </div>
  );
}

function CampaignSection({
  title,
  description,
  campaigns,
}: {
  title: string;
  description: string;
  campaigns: DirectoryCampaign[];
}) {
  return (
    <section>
      <header className="mb-4 border-l-4 border-amber-500 pl-4">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign._id} campaign={campaign} />
        ))}
      </ul>
    </section>
  );
}

function CampaignCard({ campaign }: { campaign: DirectoryCampaign }) {
  const visibility = getCampaignVisibilityConfig(campaign.visibility);
  const VisibilityIcon = visibility.icon;

  return (
    <li>
      <Link
        href={publicCampaignPath(campaign.slug, campaign.workspaceId)}
        className="group block h-full border border-zinc-800 bg-zinc-900/70 transition-colors hover:border-amber-500/40"
      >
        <BoxyImage
          imageUrl={campaign.imageUrl}
          label={campaign.name}
          aspect={16 / 9}
          className="border-0 border-b border-zinc-800"
        >
          <ScanlineOverlay />
        </BoxyImage>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                visibility.surfaceClassName,
                visibility.iconClassName,
              )}
            >
              <VisibilityIcon className="size-3" aria-hidden />
              {visibility.label}
            </span>
            {campaign.votingOpen ? (
              <span className="inline-flex items-center rounded-sm bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200">
                Vote now
              </span>
            ) : (
              <span className="inline-flex items-center rounded-sm bg-zinc-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {lifecycleLabel(campaign.lifecycle)}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-heading text-lg font-bold leading-snug text-white group-hover:text-amber-200">
              {campaign.name}
            </h3>
            {campaign.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                {campaign.description}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
