import imageCompression from "browser-image-compression";
import Compressor from "compressorjs";
import { loadImageFromFile, createCanvasFromImage } from "./image-io";
import { encodeImageData } from "./format-encoders";
import { getMimeForFormat } from "../utils/file";

const toCompressorBlob = ({ file, quality, mimeType, progressive }) => new Promise((resolve, reject) => {
  // CompressorJS quality: 0..1
  new Compressor(file, {
    quality,
    mimeType,
    strict: true,
    checkOrientation: true,
    progressive,
    convertSize: Infinity,
    success: resolve,
    error: reject,
  });
});

const resizeDimensions = ({ width, height, maxWidth, maxHeight }) => {
  const ratio = width / height;
  let nextWidth = width;
  let nextHeight = height;
  if (maxWidth && nextWidth > maxWidth) {
    nextWidth = maxWidth;
    nextHeight = Math.round(maxWidth / ratio);
  }
  if (maxHeight && nextHeight > maxHeight) {
    nextHeight = maxHeight;
    nextWidth = Math.round(maxHeight * ratio);
  }
  return { width: nextWidth, height: nextHeight };
};

export const compressImage = async ({ file, settings, analysis }) => {
  if (file.type === "image/svg+xml") {
    return { blob: file, width: analysis?.width || 0, height: analysis?.height || 0 };
  }
  const outputFormat = settings.outputFormat || "auto";
  const baseQuality = Math.max(0.05, Math.min(1, settings.quality / 100));
  const quality = settings.compressionMode === "lossless" ? 1 : baseQuality;
  const targetFormat = outputFormat === "auto"
    ? (analysis?.isTransparent ? "png" : analysis?.isPhoto ? "avif" : "webp")
    : outputFormat;

  const image = await loadImageFromFile(file);
  const baseDimensions = resizeDimensions({
    width: image.naturalWidth,
    height: image.naturalHeight,
    maxWidth: settings.resize.enabled ? settings.resize.width : null,
    maxHeight: settings.resize.enabled ? settings.resize.height : null,
  });

  const { canvas, ctx } = createCanvasFromImage(image, baseDimensions.width, baseDimensions.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (targetFormat && ["jpeg", "webp", "avif"].includes(targetFormat)) {
    const encoded = await encodeImageData({ imageData, format: targetFormat, quality });
    if (encoded) {
      return { blob: encoded, width: canvas.width, height: canvas.height };
    }
  }

  if (settings.engine === "compressorjs") {
    const mimeType = targetFormat ? getMimeForFormat(targetFormat) : file.type;
    const blob = await toCompressorBlob({ file, quality, mimeType, progressive: settings.progressive });
    return { blob, width: canvas.width, height: canvas.height };
  }

  const mimeType = targetFormat ? getMimeForFormat(targetFormat) : file.type;
  const compressedFile = await imageCompression(file, {
    maxWidthOrHeight: Math.max(baseDimensions.width, baseDimensions.height),
    useWebWorker: true,
    maxIteration: 10,
    initialQuality: quality,
    fileType: mimeType,
    preserveExif: !settings.removeMetadata,
  });

  return { blob: compressedFile, width: baseDimensions.width, height: baseDimensions.height };
};
