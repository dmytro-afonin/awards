"use client";

import { Suspense, use } from "react";
import { PublicCampaignNewsPage } from "@/components/public/public-campaign-news-page";
import { PublicShell } from "@/components/public/public-shell";
import { Skeleton } from "@/components/ui/skeleton";

type CampaignNewsRouteProps = {
  params: Promise<{ slug: string }>;
};

function CampaignNewsFallback() {
  return (
    <PublicShell>
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="h-24 w-full" />
    </PublicShell>
  );
}

function CampaignNewsRouteInner({ params }: CampaignNewsRouteProps) {
  const { slug } = use(params);
  return <PublicCampaignNewsPage slug={slug} />;
}

export default function CampaignNewsRoute({ params }: CampaignNewsRouteProps) {
  return (
    <Suspense fallback={<CampaignNewsFallback />}>
      <CampaignNewsRouteInner params={params} />
    </Suspense>
  );
}
