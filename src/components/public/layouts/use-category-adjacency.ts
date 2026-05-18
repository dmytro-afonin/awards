"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";

export function useCategoryAdjacency(
  slug: string,
  categoryId: Id<"campaignCategories">,
  searchString: string,
) {
  const workspaceId = parseWorkspaceIdFromSearch(searchString);
  const campaign = useQuery(api.publicCampaigns.getBySlug, {
    slug,
    workspaceId,
  });

  if (!campaign?.categories.length) {
    return {
      campaign: campaign ?? undefined,
      index: -1,
      total: 0,
      prev: null,
      next: null,
      votedCount: 0,
    };
  }

  const index = campaign.categories.findIndex((c) => c._id === categoryId);
  const prev = index > 0 ? (campaign.categories[index - 1] ?? null) : null;
  const next =
    index >= 0 && index < campaign.categories.length - 1
      ? (campaign.categories[index + 1] ?? null)
      : null;
  const votedCount = campaign.categories.filter(
    (c) => c.selectedNomineeId !== null,
  ).length;

  return {
    campaign,
    index,
    total: campaign.categories.length,
    prev,
    next,
    votedCount,
  };
}
