import { mutation, query } from "./_generated/server";
import { getOrCreateUserId, getUserByIdentity } from "./lib/users";

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    return await getUserByIdentity(ctx);
  },
});

/** Call after sign-in to upsert profile from Clerk. */
export const sync = mutation({
  args: {},
  handler: async (ctx) => {
    await getOrCreateUserId(ctx);
  },
});
