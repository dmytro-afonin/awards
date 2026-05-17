import type { api } from "@cvx/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type CampaignRow = FunctionReturnType<
  typeof api.campaigns.listForWorkspace
>[number];
