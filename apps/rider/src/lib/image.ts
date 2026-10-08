// apps/rider/src/lib/image.ts

/** Keeps the shape of the picture but makes its longest side at most `max`. */
export function fitWithin(
  width: number,
  height: number,
  max: number
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) return { width, height };
  const scale = max / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read the photo"));
    };
    image.src = url;
  });
}

/**
 * Phone photos are 3-8 MB. This shrinks the photo to a small JPEG
 * (default: longest side 1024 px) so it uploads fast on a weak network.
 * Returns a data URL ("data:image/jpeg;base64,...").
 */
export async function fileToResizedDataUrl(
  file: File,
  maxSize = 1024,
  quality = 0.7
): Promise<string> {
  const image = await loadImage(file);
  const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
                          }
