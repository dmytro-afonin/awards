import { v } from "convex/values";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { fieldType } from "./schema";
import { requireCampaignEditor } from "./lib/access";
import type { Doc, Id } from "./_generated/dataModel";

const fieldDefInput = v.object({
  key: v.string(),
  label: v.string(),
  type: fieldType,
  required: v.boolean(),
  order: v.number(),
});

export async function resolveFieldDefinitionsForCategory(
  ctx: QueryCtx | MutationCtx,
  categoryId: Id<"categories">
): Promise<Doc<"fieldDefinitions">[]> {
  const cat = await ctx.db.get(categoryId);
  if (!cat) return [];
  const campaignRows = await ctx.db
    .query("fieldDefinitions")
    .withIndex("by_campaign_scope", (q) =>
      q.eq("campaignId", cat.campaignId).eq("scope", "campaign")
    )
    .collect();
  const categoryRows = await ctx.db
    .query("fieldDefinitions")
    .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
    .collect();
  const map = new Map<string, Doc<"fieldDefinitions">>();
  for (const r of campaignRows) map.set(r.key, r);
  for (const r of categoryRows) map.set(r.key, r);
  return [...map.values()].sort((a, b) => a.order - b.order);
}

export const listForCategoryEditor = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    const cat = await ctx.db.get(categoryId);
    if (!cat) return null;
    await requireCampaignEditor(ctx, cat.campaignId);
    const campaignRows = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_campaign_scope", (q) =>
        q.eq("campaignId", cat.campaignId).eq("scope", "campaign")
      )
      .collect();
    const categoryRows = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
    return { campaign: campaignRows.sort((a, b) => a.order - b.order), category: categoryRows.sort((a, b) => a.order - b.order) };
  },
});

export const listForCampaignEditor = query({
  args: { campaignId: v.id("campaigns") },
  handler: async (ctx, { campaignId }) => {
    await requireCampaignEditor(ctx, campaignId);
    const campaignRows = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_campaign_scope", (q) =>
        q.eq("campaignId", campaignId).eq("scope", "campaign")
      )
      .collect();
    return campaignRows.sort((a, b) => a.order - b.order);
  },
});

export const setCampaignFields = mutation({
  args: {
    campaignId: v.id("campaigns"),
    fields: v.array(fieldDefInput),
  },
  handler: async (ctx, { campaignId, fields }) => {
    await requireCampaignEditor(ctx, campaignId);
    const existing = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_campaign_scope", (q) =>
        q.eq("campaignId", campaignId).eq("scope", "campaign")
      )
      .collect();
    for (const e of existing) await ctx.db.delete(e._id);
    for (const f of fields) {
      await ctx.db.insert("fieldDefinitions", {
        campaignId,
        scope: "campaign",
        key: f.key.trim(),
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        order: f.order,
      });
    }
  },
});

export const setCategoryFields = mutation({
  args: {
    categoryId: v.id("categories"),
    fields: v.array(fieldDefInput),
  },
  handler: async (ctx, { categoryId, fields }) => {
    const cat = await ctx.db.get(categoryId);
    if (!cat) throw new Error("Not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    const existing = await ctx.db
      .query("fieldDefinitions")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
    for (const e of existing) await ctx.db.delete(e._id);
    for (const f of fields) {
      await ctx.db.insert("fieldDefinitions", {
        campaignId: cat.campaignId,
        categoryId,
        scope: "category",
        key: f.key.trim(),
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        order: f.order,
      });
    }
  },
});
