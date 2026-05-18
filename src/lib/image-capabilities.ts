import { logImageProcessing } from "@/lib/image-processing-log";

const BENCHMARK_IMAGE_URL = "/benchmark.jpg";
const BENCHMARK_MAX_EDGE = 512;
const BENCHMARK_CACHE_KEY = "awards.canvasEncodeFormat.v1";

/** Canvas `toBlob` quality for AVIF (0–1 scale; 0.5 ≈ 50%). */
export const CANVAS_AVIF_QUALITY = 0.5;

const LOSSY_CANDIDATES = [
  { mime: "image/jpeg" as const },
  { mime: "image/webp" as const },
  { mime: "image/avif" as const, quality: CANVAS_AVIF_QUALITY },
];

export type ClientEncodeMime = "image/jpeg" | "image/webp" | "image/avif";

type BenchmarkResult = {
  mime: ClientEncodeMime;
  byteLength: number;
};

type CachedBenchmark = {
  mime: ClientEncodeMime;
  byteLength: number;
};

export type ClientImageAssessment = {
  canProcessInBrowser: boolean;
  naturalWidth: number | null;
  naturalHeight: number | null;
};

let preferredMimePromise: Promise<ClientEncodeMime> | null = null;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image failed to load"));
    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    if (quality !== undefined && mime !== "image/png") {
      canvas.toBlob(resolve, mime, quality);
      return;
    }
    canvas.toBlob(resolve, mime);
  });
}

export function getCanvasEncodeQuality(mime: string): number | undefined {
  if (mime === "image/png") {
    return undefined;
  }
  if (mime === "image/avif") {
    return CANVAS_AVIF_QUALITY;
  }
  return undefined;
}

function readBenchmarkCache(): CachedBenchmark | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(BENCHMARK_CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CachedBenchmark;
    if (
      parsed.mime !== "image/jpeg" &&
      parsed.mime !== "image/webp" &&
      parsed.mime !== "image/avif"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeBenchmarkCache(result: CachedBenchmark): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(BENCHMARK_CACHE_KEY, JSON.stringify(result));
  } catch {
    /* Quota or private mode */
  }
}

async function buildBenchmarkCanvas(): Promise<HTMLCanvasElement> {
  const image = await loadImage(BENCHMARK_IMAGE_URL);
  const longestEdge = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, BENCHMARK_MAX_EDGE / longestEdge);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create benchmark canvas.");
  }
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function runEncodeBenchmark(): Promise<BenchmarkResult> {
  const canvas = await buildBenchmarkCanvas();
  const attempts: BenchmarkResult[] = [];

  for (const candidate of LOSSY_CANDIDATES) {
    const blob = await canvasToBlob(canvas, candidate.mime, candidate.quality);
    if (blob && blob.type === candidate.mime) {
      attempts.push({ mime: candidate.mime, byteLength: blob.size });
    }
  }

  logImageProcessing("encode-benchmark", {
    pipeline: "client",
    benchmarkUrl: BENCHMARK_IMAGE_URL,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    attempts,
  });

  if (attempts.length === 0) {
    return { mime: "image/jpeg", byteLength: 0 };
  }

  return attempts.reduce((best, current) =>
    current.byteLength < best.byteLength ? current : best,
  );
}

/** Smallest canvas-encoded format on this device (cached per tab). */
export async function getPreferredOutputMime(): Promise<ClientEncodeMime> {
  if (preferredMimePromise) {
    return preferredMimePromise;
  }

  preferredMimePromise = (async () => {
    const cached = readBenchmarkCache();
    if (cached) {
      return cached.mime;
    }
    const winner = await runEncodeBenchmark();
    writeBenchmarkCache(winner);
    return winner.mime;
  })();

  return preferredMimePromise;
}

async function verifyFileEncodesWithMime(
  image: HTMLImageElement,
  mime: ClientEncodeMime,
): Promise<boolean> {
  const canvas = document.createElement("canvas");
  const w = Math.max(1, Math.min(image.naturalWidth, 64));
  const h = Math.max(1, Math.min(image.naturalHeight, 64));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return false;
  }
  ctx.drawImage(image, 0, 0, w, h);
  const blob = await canvasToBlob(canvas, mime, getCanvasEncodeQuality(mime));
  return blob !== null && blob.type === mime;
}

/**
 * One pass over the picked file: dimensions + whether client crop/encode is viable.
 */
export async function assessClientImageFile(
  file: File,
): Promise<ClientImageAssessment> {
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    if (naturalWidth < 1 || naturalHeight < 1) {
      return {
        canProcessInBrowser: false,
        naturalWidth,
        naturalHeight,
      };
    }

    const mime = await getPreferredOutputMime();
    const canProcessInBrowser = await verifyFileEncodesWithMime(image, mime);

    return {
      canProcessInBrowser,
      naturalWidth,
      naturalHeight,
    };
  } catch {
    return {
      canProcessInBrowser: false,
      naturalWidth: null,
      naturalHeight: null,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
