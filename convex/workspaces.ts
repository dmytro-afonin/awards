import { v } from "convex/values";
import { query } from "./_generated/server";
import { isAdminRole } from "./lib/access";
import { getUserId } from "./lib/users";

export const listForViewer = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("workspaces"),
      name: v.string(),
      isDefault: v.boolean(),
      role: v.union(
        v.literal("owner"),
        v.literal("admin"),
        v.literal("member"),
      ),
      canAccessAdmin: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const results = await Promise.all(
      memberships.map(async (membership) => {
        const workspace = await ctx.db.get(membership.workspaceId);
        if (!workspace) return null;
        return {
          _id: workspace._id,
          name: workspace.name,
          isDefault: workspace.isDefault,
          role: membership.role,
          canAccessAdmin: isAdminRole(membership.role),
        };
      }),
    );

    return results
      .filter((row): row is NonNullable<typeof row> => row !== null)
      .sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  },
});
