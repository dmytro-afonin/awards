import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

function defaultWorkspaceName(user: Doc<"users"> | null) {
  const base = user?.name?.trim();
  if (base) return `${base}'s workspace`;
  return "My workspace";
}

export async function ensureDefaultWorkspace(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<Id<"workspaces">> {
  const user = await ctx.db.get(userId);
  const owned = await ctx.db
    .query("workspaces")
    .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
    .collect();

  const existingDefault = owned.find((w) => w.isDefault);
  if (existingDefault) {
    await ensureOwnerMembership(ctx, existingDefault._id, userId);
    return existingDefault._id;
  }

  const workspaceId = await ctx.db.insert("workspaces", {
    name: defaultWorkspaceName(user),
    isDefault: true,
    ownerUserId: userId,
  });

  await ensureOwnerMembership(ctx, workspaceId, userId);
  return workspaceId;
}

async function ensureOwnerMembership(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  userId: Id<"users">,
) {
  const existing = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_user", (q) =>
      q.eq("workspaceId", workspaceId).eq("userId", userId),
    )
    .first();

  if (existing) {
    if (existing.role !== "owner") {
      await ctx.db.patch(existing._id, { role: "owner" });
    }
    return;
  }

  await ctx.db.insert("workspaceMembers", {
    workspaceId,
    userId,
    role: "owner",
  });
}
