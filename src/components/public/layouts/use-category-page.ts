"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";
import { useSearchParams } from "next/navigation";
import { parseWorkspaceIdFromSearch } from "@/lib/public-campaign-url";
import { useCategoryAdjacency } from "./use-category-adjacency";
import { usePublicLayout } from "./use-public-layout";
import { usePublicVote } from "./use-public-vote";

export function useCategoryPage(
  slug: string,
  categoryId: Id<"campaignCategories">,
) {
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const workspaceId = parseWorkspaceIdFromSearch(searchString);
  const layout = usePublicLayout();

  const data = useQuery(api.publicCampaigns.getCategory, {
    slug,
    categoryId,
    workspaceId,
  });

  const vote = usePublicVote(data ?? undefined);
  const adjacency = useCategoryAdjacency(slug, categoryId, searchString);

  return {
    data,
    workspaceId,
    layout,
    vote,
    adjacency,
  };
}
