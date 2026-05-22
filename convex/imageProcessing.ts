import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, type QueryCtx } from "./_generated/server";
import { requireAdminMembership } from "./lib/access";
import { assertImageStorageObject, deleteStorageFile } from "./lib/images";
import {
  type ImageProcessingTarget,
  imageProcessingTargetValidator,
} from "./lib/imageTargets";
import { getUserId } from "./lib/users";

async function getWorkspaceIdForTarget(
  ctx: QueryCtx,
  target: ImageProcessingTarget,
): Promise<Id<"workspaces">> {
  switch (target.type) {
    case "workspace":
      return target.workspaceId;
    case "campaign": {
      const doc = await ctx.db.get(target.campaignId);
      if (!doc) {
        throw new Error("Campaign not found");
      }
      return doc.workspaceId;
    }
    case "category": {
      const category = await ctx.db.get(target.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      const campaign = await ctx.db.get(category.campaignId);
      if (!campaign) {
        throw new Error("Campaign not found");
      }
      return campaign.workspaceId;
    }
    case "nominee": {
      const nominee = await ctx.db.get(target.nomineeId);
      if (!nominee) {
        throw new Error("Nominee not found");
      }
      const category = await ctx.db.get(nominee.categoryId);
      if (!category) {
        throw new Error("Category not found");
      }
      const campaign = await ctx.db.get(category.campaignId);
      if (!campaign) {
        throw new Error("Campaign not found");
      }
      return campaign.workspaceId;
    }
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}

async function assertImageTargetAccess(
  ctx: QueryCtx,
  target: ImageProcessingTarget,
): Promise<void> {
  const workspaceId = await getWorkspaceIdForTarget(ctx, target);
  await requireAdminMembership(ctx, workspaceId);
}

/** Signed URL for a staged upload (before it is linked to an entity). */
export const getStagedImageDownloadUrl = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    await assertImageStorageObject(ctx, args.storageId);
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new Error("Image not found.");
    }
    return url;
  },
});

export const generateProcessingUploadUrl = mutation({
  args: { target: imageProcessingTargetValidator },
  returns: v.string(),
  handler: async (ctx, args) => {
    await assertImageTargetAccess(ctx, args.target);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Remove the staged original after AVIF upload (entity is linked via setImage). */
export const completeImageProcessing = mutation({
  args: {
    target: imageProcessingTargetValidator,
    sourceStorageId: v.id("_storage"),
    finalStorageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertImageTargetAccess(ctx, args.target);
    if (args.sourceStorageId !== args.finalStorageId) {
      await deleteStorageFile(ctx, args.sourceStorageId);
    }
    return null;
  },
});

/** Delete a staged upload that was never linked to an entity (e.g. crop cancelled). */
export const abandonStagedImage = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized");
    }
    await assertImageStorageObject(ctx, args.storageId);
    await deleteStorageFile(ctx, args.storageId);
    return null;
  },
});
