"use client";

import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";

export function useCampaignPage(slug: string) {
  const searchParams = useSearchParams();
  const workspaceId = parseWorkspaceIdFromSearch(searchParams.toString());
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
    votedCount,
    totalCategories: campaign?.categories.length ?? 0,
  };
}
