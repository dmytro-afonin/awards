import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOrCreateUserId, getUserByIdentity } from "./lib/users";
import { ensureDefaultWorkspace } from "./lib/workspaces";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    return await getUserByIdentity(ctx);
  },
});

/** Call after sign-in to upsert profile from Clerk. */
export const sync = mutation({
  args: {},
  returns: v.object({
    userId: v.id("users"),
    defaultWorkspaceId: v.id("workspaces"),
  }),
  handler: async (ctx) => {
    const userId = await getOrCreateUserId(ctx);
    const defaultWorkspaceId = await ensureDefaultWorkspace(ctx, userId);
    return { userId, defaultWorkspaceId };
  },
});
