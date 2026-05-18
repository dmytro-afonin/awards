import type { Id } from "@cvx/_generated/dataModel";
import type { CropPercent } from "@/lib/crop-percent";
import type { ImageProcessingTarget } from "@/lib/image-processing-target";

export async function processImageFromStorage(
  sourceStorageId: Id<"_storage">,
  target: ImageProcessingTarget,
  crop: CropPercent,
  maxEdge: number,
): Promise<Id<"_storage">> {
  const response = await fetch("/api/images/process-from-storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceStorageId, target, crop, maxEdge }),
  });

  if (!response.ok) {
    let message = `Image processing failed (${response.status})`;
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

  const body = (await response.json()) as { storageId: Id<"_storage"> };
  return body.storageId;
}
