import convert from "heic-convert";

/**
 * Decode HEIC/HEIF with libheif (WASM). Vercel's sharp build often lacks HEIF
 * codecs for Mac Photos exports ("compression format has not been built in").
 */
export async function heicBufferToJpeg(
  buffer: Buffer,
  quality = 0.92,
): Promise<Buffer> {
  try {
    const output = await convert({
      buffer,
      format: "JPEG",
      quality,
    });
    return Buffer.from(output);
  } catch {
    const images = await convert.all({
      buffer,
      format: "JPEG",
      quality,
    });
    if (images.length === 0) {
      throw new Error("No image found in this HEIC file.");
    }
    const output = await images[0].convert();
    return Buffer.from(output);
  }
}
