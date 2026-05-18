import type { Area } from "react-easy-crop";
import { getCroppedImageBlob } from "@/lib/crop-image";
import {
  type ClientEncodeMime,
  getPreferredOutputMime,
} from "@/lib/image-capabilities";

export type ClientUploadStrategy = "cropped-encode" | "original-file";

export type ClientUploadPayload = {
  body: Blob;
  strategy: ClientUploadStrategy;
  encodeMime: ClientEncodeMime;
  croppedBlob: Blob;
};

/** Crop + encode in the browser; use the original file if encode grew larger than input. */
export async function buildClientUploadPayload(
  originalFile: File,
  imageSrc: string,
  pixelCrop: Area,
  maxEdge: number,
): Promise<ClientUploadPayload> {
  const encodeMime = await getPreferredOutputMime();
  const croppedBlob = await getCroppedImageBlob(imageSrc, pixelCrop, {
    maxEdge,
    mimeType: encodeMime,
  });

  const useOriginalFile = croppedBlob.size > originalFile.size;

  return {
    body: useOriginalFile ? originalFile : croppedBlob,
    strategy: useOriginalFile ? "original-file" : "cropped-encode",
    encodeMime,
    croppedBlob,
  };
}
