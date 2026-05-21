"use client";

import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";
import { useCategoryAdjacency } from "./use-category-adjacency";
import { usePublicVote } from "./use-public-vote";

export function useCategoryPage(slug: string, categorySlug: string) {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const workspaceId = parseWorkspaceIdFromSearch(searchString);

  const data = useQuery(api.publicCampaigns.getCategory, {
    slug,
    categorySlug,
    workspaceId,
  });

  const vote = usePublicVote(data ?? undefined);
  const adjacency = useCategoryAdjacency(slug, categorySlug, searchString);

  return {
    data,
    workspaceId,
    vote,
    adjacency,
  };
}
