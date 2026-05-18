/** Max longest edge after server-side crop. */
export function maxEdgeForAspect(aspect: number): number {
  return aspect >= 1 ? 1920 : 1200;
}

/** Lossy encode quality (JPEG / WebP / AVIF), 1–100. */
export const IMAGE_ENCODE_QUALITY = 100;

/** AVIF encoder effort, 0–9 (9 = slowest, best compression at a given quality). */
export const IMAGE_AVIF_EFFORT = 9;
