import { encode as encodeJpeg } from "@jsquash/jpeg";
import { encode as encodeWebp } from "@jsquash/webp";
import { encode as encodeAvif } from "@jsquash/avif";
import { arrayBufferToBlob } from "./image-io";

export const encodeImageData = async ({ imageData, format, quality }) => {
  const normalizedQuality = Math.max(0.1, Math.min(1, quality));
  if (format === "jpeg") {
    const buffer = await encodeJpeg(imageData, { quality: Math.round(normalizedQuality * 100) });
    return arrayBufferToBlob(buffer, "image/jpeg");
  }
  if (format === "webp") {
    const buffer = await encodeWebp(imageData, { quality: Math.round(normalizedQuality * 100) });
    return arrayBufferToBlob(buffer, "image/webp");
  }
  if (format === "avif") {
    const buffer = await encodeAvif(imageData, { quality: Math.round(normalizedQuality * 100) });
    return arrayBufferToBlob(buffer, "image/avif");
  }
  return null;
};
