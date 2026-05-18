"use client";

import {
  getLayoutPages,
  PublicLayoutChrome,
} from "@/components/public/layouts/registry";
import { usePublicLayout } from "@/components/public/layouts/use-public-layout";

export function PublicCampaignPage({ slug }: { slug: string }) {
  const layout = usePublicLayout();
  const { Campaign } = getLayoutPages(layout);

  return (
    <>
      <Campaign slug={slug} />
      <PublicLayoutChrome />
    </>
  );
}
