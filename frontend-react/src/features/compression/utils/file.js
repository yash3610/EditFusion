export const supportedFormats = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"];

export const sanitizeFileName = (name) => name.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-");

export const getExtensionForMime = (mime) => {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  return "jpg";
};

export const getMimeForFormat = (format) => {
  if (format === "png") return "image/png";
  if (format === "webp") return "image/webp";
  if (format === "avif") return "image/avif";
  return "image/jpeg";
};
