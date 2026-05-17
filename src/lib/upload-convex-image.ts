import type { Id } from "@cvx/_generated/dataModel";

type GenerateUploadUrl = () => Promise<string>;

export async function uploadImageBlob(
  generateUploadUrl: GenerateUploadUrl,
  blob: Blob,
): Promise<Id<"_storage">> {
  const postUrl = await generateUploadUrl();
  const response = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/webp" },
    body: blob,
  });
  if (!response.ok) {
    throw new Error("Image upload failed. Try again.");
  }
  const json = (await response.json()) as { storageId: Id<"_storage"> };
  return json.storageId;
}
