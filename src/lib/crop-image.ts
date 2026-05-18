import type { Area } from "react-easy-crop";
import { getCanvasEncodeQuality } from "@/lib/image-capabilities";
import { logImageProcessing } from "@/lib/image-processing-log";

/** File type checks for the image upload field. */

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") {
    return true;
  }
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export function isAllowedImageFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (
    type === "image/jpeg" ||
    type === "image/png" ||
    type === "image/webp" ||
    type === "image/avif" ||
    type === "image/heic" ||
    type === "image/heif"
  ) {
    return true;
  }
  if (type === "" || type === "application/octet-stream") {
    const name = file.name.toLowerCase();
    return name.endsWith(".heic") || name.endsWith(".heif");
  }
  return false;
}

export type CropOutputOptions = {
  /** Max longest edge (matches server `maxEdge`). */
  maxEdge?: number;
  /** @deprecated Use `maxEdge` — treated as max longest edge when set alone. */
  maxWidth?: number;
  mimeType?: string;
  /** Omit to use the browser encoder default (see `canvas.toBlob`). */
  quality?: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  options: CropOutputOptions = {},
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare image canvas.");
  }

  const maxEdge = options.maxEdge ?? options.maxWidth ?? 1920;
  const longestEdge = Math.max(pixelCrop.width, pixelCrop.height);
  const scale = Math.min(1, maxEdge / longestEdge);
  canvas.width = Math.round(pixelCrop.width * scale);
  canvas.height = Math.round(pixelCrop.height * scale);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const mimeType = options.mimeType ?? "image/jpeg";
  const encodeQuality =
    mimeType === "image/png"
      ? undefined
      : (options.quality ?? getCanvasEncodeQuality(mimeType));

  logImageProcessing("client-crop-export", {
    pipeline: "client",
    sourceNaturalWidth: image.naturalWidth,
    sourceNaturalHeight: image.naturalHeight,
    pixelCrop,
    maxEdge,
    longestEdge,
    scale,
    outputWidth: canvas.width,
    outputHeight: canvas.height,
    mimeType,
    qualityArgumentPassed: encodeQuality !== undefined,
    qualityArgument: encodeQuality ?? null,
  });

  return new Promise((resolve, reject) => {
    const onBlob = (blob: Blob | null) => {
      if (!blob) {
        reject(new Error("Could not export cropped image."));
        return;
      }
      if (blob.type !== mimeType) {
        reject(
          new Error(
            `Browser exported ${blob.type || "unknown"} instead of ${mimeType}.`,
          ),
        );
        return;
      }
      resolve(blob);
    };

    if (encodeQuality !== undefined) {
      canvas.toBlob(onBlob, mimeType, encodeQuality);
    } else {
      canvas.toBlob(onBlob, mimeType);
    }
  });
}
