import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { getUserId } from "./users";

export type AdminMembership = Doc<"workspaceMembers"> & {
  workspace: Doc<"workspaces">;
};

export async function getMembership(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  return await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .first();
}

export function isAdminRole(role: Doc<"workspaceMembers">["role"]) {
  return role === "owner" || role === "admin";
}

export async function requireAdminMembership(
  ctx: QueryCtx,
  workspaceId: Id<"workspaces">,
): Promise<AdminMembership> {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const membership = await getMembership(ctx, workspaceId, userId);
  if (!membership || !isAdminRole(membership.role)) {
    throw new Error("Forbidden");
  }
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }
  return { ...membership, workspace };
}
