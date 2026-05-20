import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type StoryCampaign = NonNullable<
  FunctionReturnType<typeof api.publicCampaigns.getBySlug>
>;

export type StoryCategoryGridProps = {
  campaign: StoryCampaign;
};
