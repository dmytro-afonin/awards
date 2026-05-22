import type { Infer } from "convex/values";
import { v } from "convex/values";

export const imageProcessingTargetValidator = v.union(
  v.object({
    type: v.literal("workspace"),
    workspaceId: v.id("workspaces"),
  }),
  v.object({
    type: v.literal("campaign"),
    campaignId: v.id("campaigns"),
  }),
  v.object({
    type: v.literal("category"),
    categoryId: v.id("campaignCategories"),
  }),
  v.object({
    type: v.literal("nominee"),
    nomineeId: v.id("campaignNominees"),
  }),
);

export type ImageProcessingTarget = Infer<
  typeof imageProcessingTargetValidator
>;
