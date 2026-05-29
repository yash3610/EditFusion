export const loadImageFromFile = (file) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = URL.createObjectURL(file);
});

export const createCanvasFromImage = (image, width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width ?? image.naturalWidth;
  canvas.height = height ?? image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, ctx };
};

export const blobToArrayBuffer = async (blob) => blob.arrayBuffer();

export const arrayBufferToBlob = (buffer, mimeType) => new Blob([buffer], { type: mimeType });

export const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};
