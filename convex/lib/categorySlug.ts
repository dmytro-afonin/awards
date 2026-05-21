import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { slugifyName, uniqueSlugSuffix } from "./slug";

type Ctx = QueryCtx | MutationCtx;

type CategorySlugSource = Pick<Doc<"campaignCategories">, "name" | "slug">;

/** Public/admin output fallback until backfill has run on older rows. */
export function categorySlugForOutput(category: CategorySlugSource): string {
  if (category.slug) {
    return category.slug;
  }
  return slugifyName(category.name) || "category";
}

export async function backfillMissingCategorySlugs(
  ctx: MutationCtx,
): Promise<number> {
  const categories = await ctx.db.query("campaignCategories").collect();
  let count = 0;

  for (const category of categories) {
    if (category.slug) {
      continue;
    }
    const slug = await resolveUniqueCategorySlug(
      ctx,
      category.campaignId,
      category.name,
    );
    await ctx.db.patch(category._id, { slug });
    count += 1;
  }

  return count;
}

export async function countCategoriesMissingSlug(
  ctx: QueryCtx,
): Promise<number> {
  const categories = await ctx.db.query("campaignCategories").collect();
  return categories.filter((category) => !category.slug).length;
}

export async function findCategoryBySlug(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
  slug: string,
) {
  const trimmed = slug.trim();
  if (!trimmed) {
    return null;
  }

  return await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign_and_slug", (q) =>
      q.eq("campaignId", campaignId).eq("slug", trimmed),
    )
    .first();
}

export async function resolveUniqueCategorySlug(
  ctx: Ctx,
  campaignId: Id<"campaigns">,
  raw: string,
  excludeCategoryId?: Id<"campaignCategories">,
): Promise<string> {
  let slug = slugifyName(raw);
  if (!slug) {
    slug = "category";
  }

  const clash = await ctx.db
    .query("campaignCategories")
    .withIndex("by_campaign_and_slug", (q) =>
      q.eq("campaignId", campaignId).eq("slug", slug),
    )
    .first();

  if (clash && clash._id !== excludeCategoryId) {
    slug = `${slug}-${uniqueSlugSuffix()}`;
  }

  return slug;
}
