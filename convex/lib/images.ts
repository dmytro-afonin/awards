import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function resolveStorageImageUrl(
  ctx: QueryCtx | MutationCtx,
  storageId: Id<"_storage"> | undefined,
): Promise<string | undefined> {
  if (!storageId) {
    return undefined;
  }
  return (await ctx.storage.getUrl(storageId)) ?? undefined;
}

export async function deleteStorageFile(
  ctx: MutationCtx,
  storageId: Id<"_storage"> | undefined,
): Promise<void> {
  if (!storageId) {
    return;
  }
  await ctx.storage.delete(storageId);
}

export async function assertImageStorageObject(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
): Promise<void> {
  const metadata = await ctx.db.system.get("_storage", storageId);
  if (!metadata) {
    throw new Error("Uploaded file not found. Try uploading again.");
  }
  const contentType = metadata.contentType ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }
}
