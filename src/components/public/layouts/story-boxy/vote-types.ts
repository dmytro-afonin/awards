import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";
import type { useCategoryPage } from "@/components/public/layouts/use-category-page";

export type StoryCategoryData = NonNullable<
  FunctionReturnType<typeof api.publicCampaigns.getCategory>
>;

export type StoryVoteHandlers = ReturnType<typeof useCategoryPage>["vote"];

export type StoryVoteGridProps = {
  data: StoryCategoryData;
  vote: StoryVoteHandlers;
};
