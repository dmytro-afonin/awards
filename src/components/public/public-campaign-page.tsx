"use client";

import { StoryCampaignPage } from "@/components/public/layouts/story";

export function PublicCampaignPage({ slug }: { slug: string }) {
  return <StoryCampaignPage slug={slug} />;
}
