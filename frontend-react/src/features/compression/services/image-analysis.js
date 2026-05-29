import { loadImageFromFile, createCanvasFromImage } from "./image-io";

const samplePixels = (data, width, height, step = 10) => {
  const samples = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      samples.push([data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]);
    }
  }
  return samples;
};

export const analyzeImage = async (file) => {
  const image = await loadImageFromFile(file);
  const { canvas, ctx } = createCanvasFromImage(image, Math.min(320, image.naturalWidth), Math.min(320, image.naturalHeight));
  const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const samples = samplePixels(data, width, height, Math.max(2, Math.floor(Math.min(width, height) / 40)));

  let transparentPixels = 0;
  let colorVariance = 0;
  let last = null;
  const uniqueColors = new Set();

  samples.forEach(([r, g, b, a]) => {
    if (a < 250) transparentPixels += 1;
    uniqueColors.add(`${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`);
    if (last) {
      colorVariance += Math.abs(r - last[0]) + Math.abs(g - last[1]) + Math.abs(b - last[2]);
    }
    last = [r, g, b];
  });

  const transparencyRatio = transparentPixels / samples.length;
  const avgVariance = colorVariance / Math.max(1, samples.length - 1);
  const colorBuckets = uniqueColors.size;

  const isTransparent = transparencyRatio > 0.02;
  const isIllustration = colorBuckets < 160 && avgVariance < 28;
  const isScreenshot = colorBuckets < 110 && avgVariance < 22;
  const isPhoto = !isIllustration && !isScreenshot;

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    transparencyRatio,
    isTransparent,
    isPhoto,
    isIllustration,
    isScreenshot,
  };
};
