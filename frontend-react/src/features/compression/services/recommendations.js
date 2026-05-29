export const getFormatRecommendation = (analysis) => {
  if (!analysis) return null;
  if (analysis.isTransparent) {
    return { format: "png", message: "PNG or WEBP is best for transparency." };
  }
  if (analysis.isPhoto) {
    return { format: "avif", message: "AVIF gives the best compression for photos." };
  }
  if (analysis.isScreenshot || analysis.isIllustration) {
    return { format: "webp", message: "WEBP keeps crisp edges with smaller size." };
  }
  return { format: "webp", message: "WEBP is a strong default for size + quality." };
};

export const estimateSavings = ({ originalSize, compressedSize }) => {
  if (!originalSize || !compressedSize) return 0;
  return Math.max(0, ((originalSize - compressedSize) / originalSize) * 100);
};
