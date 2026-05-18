"use client";

import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useQuery } from "convex/react";

export function useCampaignDetailData(campaignId: Id<"campaigns">) {
  const campaign = useQuery(api.campaigns.getForAdmin, { campaignId });
  const categories = useQuery(api.campaignCategories.overviewForAdmin, {
    campaignId,
  });
  const readiness = useQuery(api.campaignCategories.readinessSummary, {
    campaignId,
  });

  const isLoading =
    campaign === undefined ||
    categories === undefined ||
    readiness === undefined;

  return { campaign, categories, readiness, isLoading };
}
