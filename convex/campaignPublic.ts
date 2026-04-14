import { v } from "convex/values";
import { query } from "./_generated/server";
import { canEditCampaign, canViewCampaign } from "./lib/access";
import { resolveFieldDefinitionsForCategory } from "./fields";

export const getBySlug = query({
  args: {
    slug: v.string(),
    inviteToken: v.optional(v.string()),
  },
  handler: async (ctx, { slug, inviteToken }) => {
    const normalized = slug.trim().toLowerCase();
    const campaign = await ctx.db
      .query("campaigns")
      .withIndex("by_slug", (q) => q.eq("slug", normalized))
      .unique();
    if (!campaign) return null;
    const ok = await canViewCampaign(ctx, campaign._id, { inviteToken });
    if (!ok) return null;
    const editable = await canEditCampaign(ctx, campaign._id);
    const categories = (
      await ctx.db
        .query("categories")
        .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
        .collect()
    ).sort((a, b) => a.order - b.order);
    const visibleCategories = editable
      ? categories
      : categories.filter((category) => category.status !== "draft");
    const categoriesWithNominees = await Promise.all(
      visibleCategories.map(async (cat) => {
        const nominees = await ctx.db
          .query("nominees")
          .withIndex("by_category", (q) => q.eq("categoryId", cat._id))
          .collect();
        const fieldDefs = await resolveFieldDefinitionsForCategory(ctx, cat._id);
        const categoryImageUrl = cat.imageStorageId
          ? await ctx.storage.getUrl(cat.imageStorageId)
          : null;
        const nomineesWithUrls = await Promise.all(
          nominees.map(async (n) => ({
            ...n,
            imageUrl: n.imageStorageId ? await ctx.storage.getUrl(n.imageStorageId) : null,
          }))
        );
        return {
          ...cat,
          imageUrl: categoryImageUrl,
          nominees: nomineesWithUrls.sort((a, b) => a.order - b.order),
          fieldDefinitions: fieldDefs,
        };
      })
    );
    return { campaign, categories: categoriesWithNominees };
  },
});

export const listBrowse = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
      .collect();

    const rows = await Promise.all(
      campaigns.map(async (campaign) => {
        const categories = (
          await ctx.db
            .query("categories")
            .withIndex("by_campaign", (q) => q.eq("campaignId", campaign._id))
            .collect()
        ).sort((a, b) => a.order - b.order);
        const nonDraftCategories = categories.filter((category) => category.status !== "draft");
        const activeCategories = nonDraftCategories.filter(
          (category) => category.status === "active"
        );
        let nomineeCount = 0;
        for (const category of nonDraftCategories) {
          const nominees = await ctx.db
            .query("nominees")
            .withIndex("by_category", (q) => q.eq("categoryId", category._id))
            .collect();
          nomineeCount += nominees.length;
        }
        const previewCategory = nonDraftCategories.find((category) => category.imageStorageId);
        const previewImageUrl = previewCategory?.imageStorageId
          ? await ctx.storage.getUrl(previewCategory.imageStorageId)
          : null;

        return {
          campaign,
          previewImageUrl,
          totalCategoryCount: nonDraftCategories.length,
          activeCategoryCount: activeCategories.length,
          votableCategoryCount: activeCategories.length,
          nomineeCount,
        };
      })
    );

    return rows.sort((a, b) => {
      if (b.votableCategoryCount !== a.votableCategoryCount) {
        return b.votableCategoryCount - a.votableCategoryCount;
      }
      if (b.activeCategoryCount !== a.activeCategoryCount) {
        return b.activeCategoryCount - a.activeCategoryCount;
      }
      return b.campaign.updatedAt - a.campaign.updatedAt;
    });
  },
});
