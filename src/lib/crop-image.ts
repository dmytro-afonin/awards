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
