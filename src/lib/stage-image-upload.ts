import type { Id } from "@cvx/_generated/dataModel";

type GenerateUploadUrl = () => Promise<string>;

export async function uploadOriginalToStorage(
  generateUploadUrl: GenerateUploadUrl,
  file: File,
): Promise<Id<"_storage">> {
  const postUrl = await generateUploadUrl();
  const response = await fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });
  if (!response.ok) {
    throw new Error("Could not upload photo. Try again.");
  }
  const json = (await response.json()) as { storageId: Id<"_storage"> };
  return json.storageId;
}

/** JPEG for the crop UI (server decodes HEIC; no size limit from Vercel body). */
export async function fetchCropPreviewBlob(
  storageId: Id<"_storage">,
): Promise<Blob> {
  const response = await fetch("/api/images/preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storageId }),
  });
  if (!response.ok) {
    let message = `Could not prepare preview (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) {
        message = body.error;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.blob();
}
