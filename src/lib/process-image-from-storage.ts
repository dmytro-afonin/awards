import type { Id } from "@cvx/_generated/dataModel";
import type { CropPercent } from "@/lib/crop-percent";
import type { ImageProcessingTarget } from "@/lib/image-processing-target";
import { parseFetchErrorMessage } from "@/lib/parse-fetch-error-message";

export type ProcessImageFromStorageResult = {
  storageId: Id<"_storage">;
  format: string;
  byteLength: number;
};

export async function processImageFromStorage(
  sourceStorageId: Id<"_storage">,
  target: ImageProcessingTarget,
  crop: CropPercent,
  maxEdge: number,
): Promise<ProcessImageFromStorageResult> {
  const response = await fetch("/api/images/process-from-storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceStorageId, target, crop, maxEdge }),
  });

  if (!response.ok) {
    const message = await parseFetchErrorMessage(
      response,
      `Image processing failed (${response.status})`,
    );
    throw new Error(message);
  }

  return (await response.json()) as ProcessImageFromStorageResult;
}
