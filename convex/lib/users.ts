import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized");
  }
  return identity;
}

function getStableTokenIdentifier(identity: Awaited<ReturnType<typeof requireIdentity>>) {
  return identity.tokenIdentifier ?? identity.subject;
}

function getTokenIdentifierVariants(tokenIdentifier: string, subject: string | null | undefined) {
  const variants = new Set<string>();
  if (tokenIdentifier) variants.add(tokenIdentifier);
  if (subject) variants.add(subject);
  const tokenSuffix = tokenIdentifier.split("|").pop();
  if (tokenSuffix) variants.add(tokenSuffix);
  return [...variants];
}

async function chooseBestUserMatch(
  ctx: QueryCtx | MutationCtx,
  candidates: Array<Doc<"users"> | null>
) {
  const uniqueCandidates = candidates.filter(
    (candidate, index, all): candidate is NonNullable<typeof candidate> =>
      candidate !== null && all.findIndex((row) => row?._id === candidate?._id) === index
  );
  if (uniqueCandidates.length <= 1) return uniqueCandidates[0] ?? null;

  const scored = await Promise.all(
    uniqueCandidates.map(async (candidate) => {
      const ownedCampaigns = await ctx.db
        .query("campaigns")
        .withIndex("by_owner", (q) => q.eq("ownerId", candidate._id))
        .take(1);
      const memberships = await ctx.db
        .query("campaignMembers")
        .withIndex("by_user", (q) => q.eq("userId", candidate._id))
        .take(1);
      const score = (ownedCampaigns.length > 0 ? 2 : 0) + (memberships.length > 0 ? 1 : 0);
      return { candidate, score };
    })
  );

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.candidate ?? uniqueCandidates[0] ?? null;
}

async function findUserByIdentity(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  subject: string | null | undefined,
  email?: string | null
) {
  const candidates: Array<Doc<"users"> | null> = [];
  for (const variant of getTokenIdentifierVariants(tokenIdentifier, subject)) {
    const byToken = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", variant))
      .collect();
    candidates.push(...byToken);
  }
  const normalizedEmail = email?.trim().toLowerCase();
  if (normalizedEmail) {
    const users = await ctx.db.query("users").collect();
    candidates.push(
      ...users.filter((user) => user.email?.trim().toLowerCase() === normalizedEmail)
    );
  }
  return await chooseBestUserMatch(ctx, candidates);
}

export async function getOrCreateUserId(ctx: MutationCtx): Promise<Id<"users">> {
  const identity = await requireIdentity(ctx);
  const tokenIdentifier = getStableTokenIdentifier(identity);
  const existing = await findUserByIdentity(
    ctx,
    tokenIdentifier,
    identity.subject,
    identity.email
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

export async function getUserByIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const tokenIdentifier = getStableTokenIdentifier(identity);
  return await findUserByIdentity(
    ctx,
    tokenIdentifier,
    identity.subject,
    identity.email
  );
}

export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> {
  const u = await getUserByIdentity(ctx);
  return u?._id ?? null;
}
