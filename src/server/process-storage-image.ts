import sharp from "sharp";
import type { CropPercent } from "@/lib/crop-percent";
import {
  IMAGE_AVIF_EFFORT,
  IMAGE_ENCODE_QUALITY,
} from "@/lib/image-process-config";
import { heicBufferToJpeg } from "@/server/heic-to-jpeg";

type OutputFormat = "jpeg" | "avif" | "webp" | "png";

export type ProcessedImageResult = {
  buffer: Buffer;
  contentType: string;
  format: OutputFormat;
  byteLength: number;
};

function isHeicBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) {
    return false;
  }
  const ftyp = buffer.subarray(4, 8).toString("ascii");
  if (ftyp !== "ftyp") {
    return false;
  }
  const brand = buffer.subarray(8, 12).toString("ascii");
  return (
    brand.startsWith("heic") ||
    brand.startsWith("heix") ||
    brand.startsWith("hevc") ||
    brand.startsWith("hevx") ||
    brand.startsWith("mif1") ||
    brand.startsWith("msf1")
  );
}

async function decodeForProcessing(buffer: Buffer): Promise<Buffer> {
  if (isHeicBuffer(buffer)) {
    return heicBufferToJpeg(buffer);
  }
  return buffer;
}

/** Map react-easy-crop % (0–100) to pixel rect inside oriented image bounds. */
export function extractRect(
  imageWidth: number,
  imageHeight: number,
  crop: CropPercent,
) {
  const x = Math.max(0, Math.min(100, crop.x));
  const y = Math.max(0, Math.min(100, crop.y));
  const w = Math.max(0, Math.min(100 - x, crop.width));
  const h = Math.max(0, Math.min(100 - y, crop.height));

  let left = Math.round((x / 100) * imageWidth);
  let top = Math.round((y / 100) * imageHeight);
  let width = Math.round((w / 100) * imageWidth);
  let height = Math.round((h / 100) * imageHeight);

  left = Math.max(0, Math.min(left, imageWidth - 1));
  top = Math.max(0, Math.min(top, imageHeight - 1));
  width = Math.max(1, Math.min(width, imageWidth - left));
  height = Math.max(1, Math.min(height, imageHeight - top));

  return { left, top, width, height };
}

async function buildCroppedPipeline(
  sourceBuffer: Buffer,
  crop: CropPercent,
  maxEdge: number,
): Promise<sharp.Sharp> {
  const decoded = await decodeForProcessing(sourceBuffer);
  const { data: orientedPixels, info } = await sharp(decoded)
    .rotate()
    .toBuffer({ resolveWithObject: true });

  const imageWidth = info.width;
  const imageHeight = info.height;
  if (imageWidth < 1 || imageHeight < 1) {
    throw new Error("Could not read image dimensions.");
  }

  const { left, top, width, height } = extractRect(
    imageWidth,
    imageHeight,
    crop,
  );

  let pipeline = sharp(orientedPixels).extract({ left, top, width, height });

  const longestEdge = Math.max(width, height);
  const scale = Math.min(1, maxEdge / longestEdge);
  if (scale < 1) {
    pipeline = pipeline.resize({
      width: Math.max(1, Math.round(width * scale)),
      height: Math.max(1, Math.round(height * scale)),
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  return pipeline;
}

const CONTENT_TYPES: Record<OutputFormat, string> = {
  jpeg: "image/jpeg",
  avif: "image/avif",
  webp: "image/webp",
  png: "image/png",
};

async function encodeFormat(
  pipeline: sharp.Sharp,
  format: OutputFormat,
): Promise<ProcessedImageResult> {
  let buffer: Buffer;
  switch (format) {
    case "jpeg":
      buffer = await pipeline
        .clone()
        .jpeg({ quality: IMAGE_ENCODE_QUALITY })
        .toBuffer();
      break;
    case "avif":
      buffer = await pipeline
        .clone()
        .avif({
          quality: IMAGE_ENCODE_QUALITY,
          effort: IMAGE_AVIF_EFFORT,
        })
        .toBuffer();
      break;
    case "webp":
      buffer = await pipeline
        .clone()
        .webp({ quality: IMAGE_ENCODE_QUALITY })
        .toBuffer();
      break;
    case "png":
      buffer = await pipeline.clone().png().toBuffer();
      break;
    default: {
      const _exhaustive: never = format;
      throw new Error(`Unsupported format: ${_exhaustive}`);
    }
  }

  return {
    buffer,
    contentType: CONTENT_TYPES[format],
    format,
    byteLength: buffer.length,
  };
}

const ALL_OUTPUT_FORMATS: OutputFormat[] = ["jpeg", "avif", "webp", "png"];

function pickSmallest(
  candidates: ProcessedImageResult[],
): ProcessedImageResult {
  return candidates.reduce((best, candidate) =>
    candidate.byteLength < best.byteLength ? candidate : best,
  );
}

/** Crop + resize, encode JPEG/AVIF/WebP/PNG in parallel, return the smallest. */
export async function processStorageImageToSmallest(
  sourceBuffer: Buffer,
  crop: CropPercent,
  maxEdge: number,
): Promise<ProcessedImageResult> {
  const pipeline = await buildCroppedPipeline(sourceBuffer, crop, maxEdge);

  const encoded = await Promise.all(
    ALL_OUTPUT_FORMATS.map((format) => encodeFormat(pipeline, format)),
  );

  return pickSmallest(encoded);
}

export async function bufferToDisplayJpeg(buffer: Buffer): Promise<Buffer> {
  const decoded = await decodeForProcessing(buffer);
  return sharp(decoded).rotate().jpeg({ quality: 100 }).toBuffer();
}

/** @deprecated Use processStorageImageToSmallest */
export async function processStorageImageToAvif(
  buffer: Buffer,
  crop: CropPercent,
  maxEdge: number,
): Promise<Buffer> {
  const pipeline = await buildCroppedPipeline(buffer, crop, maxEdge);
  const result = await encodeFormat(pipeline, "avif");
  return result.buffer;
}
