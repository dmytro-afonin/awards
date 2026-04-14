import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { resolveFieldDefinitionsForCategory } from "./fields";
import { requireCampaignEditor, requireCampaignMember } from "./lib/access";
import type { Doc } from "./_generated/dataModel";

const fieldValue = v.union(
  v.object({ type: v.literal("string"), value: v.string() }),
  v.object({
    type: v.literal("location"),
    label: v.string(),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
  }),
  v.object({ type: v.literal("date"), iso: v.string() })
);

function validateFieldValues(
  defs: Doc<"fieldDefinitions">[],
  values: Record<string, unknown>
) {
  const keys = new Set(Object.keys(values));
  for (const d of defs) {
    const val = values[d.key];
    if (d.required && (val === undefined || val === null)) {
      throw new Error(`Missing required field: ${d.key}`);
    }
    if (val === undefined || val === null) continue;
    const obj = val as { type?: string };
    if (obj.type !== d.type) {
      throw new Error(`Type mismatch for ${d.key}`);
    }
    if (d.type === "string") {
      const o = val as { type: string; value: string };
      if (typeof o.value !== "string") throw new Error(`Invalid string field ${d.key}`);
    }
    if (d.type === "date") {
      const o = val as { type: string; iso: string };
      if (typeof o.iso !== "string" || Number.isNaN(Date.parse(o.iso))) {
        throw new Error(`Invalid date field ${d.key}`);
      }
    }
    if (d.type === "location") {
      const o = val as { type: string; label: string };
      if (typeof o.label !== "string") throw new Error(`Invalid location field ${d.key}`);
    }
  }
  for (const k of keys) {
    if (!defs.some((d) => d.key === k)) {
      throw new Error(`Unknown field key: ${k}`);
    }
  }
}

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    const cat = await ctx.db.get(categoryId);
    if (!cat) return [];
    await requireCampaignMember(ctx, cat.campaignId);
    return await ctx.db
      .query("nominees")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
  },
});

export const create = mutation({
  args: {
    categoryId: v.id("categories"),
    title: v.string(),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    fieldValues: v.record(v.string(), fieldValue),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    const defs = await resolveFieldDefinitionsForCategory(ctx, args.categoryId);
    validateFieldValues(defs, args.fieldValues as Record<string, unknown>);
    const existing = await ctx.db
      .query("nominees")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    const order = args.order ?? existing.length;
    const now = Date.now();
    return await ctx.db.insert("nominees", {
      categoryId: args.categoryId,
      title: args.title.trim(),
      tags: args.tags ?? [],
      order,
      fieldValues: args.fieldValues,
      imageStorageId: args.imageStorageId,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("nominees"),
    title: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
    fieldValues: v.optional(v.record(v.string(), fieldValue)),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    isWinner: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, fieldValues, imageStorageId, ...patch }) => {
    const n = await ctx.db.get(id);
    if (!n) throw new Error("Not found");
    const cat = await ctx.db.get(n.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    const defs = await resolveFieldDefinitionsForCategory(ctx, n.categoryId);
    const nextValues = fieldValues ?? n.fieldValues;
    validateFieldValues(defs, nextValues as Record<string, unknown>);
    await ctx.db.patch(id, {
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.tags !== undefined ? { tags: patch.tags } : {}),
      ...(patch.order !== undefined ? { order: patch.order } : {}),
      ...(fieldValues !== undefined ? { fieldValues: nextValues } : {}),
      ...(imageStorageId !== undefined ? { imageStorageId: imageStorageId ?? undefined } : {}),
      ...(patch.isWinner !== undefined ? { isWinner: patch.isWinner } : {}),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("nominees") },
  handler: async (ctx, { id }) => {
    const n = await ctx.db.get(id);
    if (!n) throw new Error("Not found");
    const cat = await ctx.db.get(n.categoryId);
    if (!cat) throw new Error("Category not found");
    await requireCampaignEditor(ctx, cat.campaignId);
    const votes = await ctx.db
      .query("votes")
      .withIndex("by_nominee", (q) => q.eq("nomineeId", id))
      .collect();
    for (const v of votes) await ctx.db.delete(v._id);
    await ctx.db.delete(id);
  },
});
