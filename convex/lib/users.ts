import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

function getStableTokenIdentifier(
  identity: Awaited<ReturnType<typeof requireIdentity>>,
) {
  return identity.tokenIdentifier ?? identity.subject;
}

function getTokenIdentifierVariants(
  tokenIdentifier: string,
  subject: string | null | undefined,
) {
  const variants = new Set<string>();
  if (tokenIdentifier) variants.add(tokenIdentifier);
  if (subject) variants.add(subject);
  const tokenSuffix = tokenIdentifier.split("|").pop();
  if (tokenSuffix) variants.add(tokenSuffix);
  return [...variants];
}

async function findUserByIdentity(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  subject: string | null | undefined,
) {
  for (const variant of getTokenIdentifierVariants(tokenIdentifier, subject)) {
    const row = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", variant))
      .first();
    if (row) return row;
  }
  return null;
}

export async function getOrCreateUserId(
  ctx: MutationCtx,
): Promise<Id<"users">> {
  const identity = await requireIdentity(ctx);
  const tokenIdentifier = getStableTokenIdentifier(identity);
  const existing = await findUserByIdentity(
    ctx,
    tokenIdentifier,
    identity.subject,
  );
  if (existing) {
    await ctx.db.patch(existing._id, {
      tokenIdentifier,
      name: identity.name ?? existing.name,
      email: identity.email ?? existing.email,
      image: identity.pictureUrl ?? existing.image,
    });
    return existing._id;
  }
  return await ctx.db.insert("users", {
    tokenIdentifier,
    name: identity.name,
    email: identity.email,
    image: identity.pictureUrl,
  });
}

export async function getUserByIdentity(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const tokenIdentifier = getStableTokenIdentifier(identity);
  return await findUserByIdentity(ctx, tokenIdentifier, identity.subject);
}

export async function getUserId(
  ctx: QueryCtx | MutationCtx,
): Promise<Id<"users"> | null> {
  const u = await getUserByIdentity(ctx);
  return u?._id ?? null;
}
