"use client";

import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";
import { usePublicLayout } from "./use-public-layout";

export function useCampaignPage(slug: string) {
  const searchParams = useSearchParams();
  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
  const layout = usePublicLayout();
  const campaign = useQuery(api.publicCampaigns.getBySlug, {
    slug,
    workspaceId,
  });
  const votedCount =
    campaign?.categories.filter((c) => c.selectedNomineeId !== null).length ??
    0;

  return {
    campaign,
    workspaceId,
    layout,
    votedCount,
    totalCategories: campaign?.categories.length ?? 0,
  };
}
