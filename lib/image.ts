/**
 * Downscales an image file in the browser before upload: shrinks anything
 * larger than `maxDimension` on its longest side and re-encodes as JPEG.
 * Falls back to the original file if resizing isn't possible/helpful (e.g.
 * SVGs, or a resize that doesn't come out smaller).
 */
export async function resizeImageFile(
  file: File,
  { maxDimension = 1920, quality = 0.82 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Any failure (unsupported format, decode error) just falls back to the original.
    return file;
  }
}
