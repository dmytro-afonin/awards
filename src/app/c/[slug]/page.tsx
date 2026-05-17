"use client";

import { Suspense, use } from "react";
import { PublicCampaignPage } from "@/components/public/public-campaign-page";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

type PublicCampaignPageProps = {
  params: Promise<{ slug: string }>;
};

function CampaignPageFallback() {
  return (
    <PublicShell>
      <Skeleton className="mb-6 h-48 w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </PublicShell>
  );
}

export default function CampaignRoute({ params }: PublicCampaignPageProps) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<CampaignPageFallback />}>
      <PublicCampaignPage slug={slug} />
    </Suspense>
  );
}
