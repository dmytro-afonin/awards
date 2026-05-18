/** Crop rectangle as % of image size (react-easy-crop `croppedArea`). */
export type CropPercent = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function parseCropPercent(raw: unknown): CropPercent | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }
  const crop = raw as Record<string, unknown>;
  const x = Number(crop.x);
  const y = Number(crop.y);
  const width = Number(crop.width);
  const height = Number(crop.height);
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }
  return { x, y, width, height };
}
