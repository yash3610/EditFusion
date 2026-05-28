import { v2 as cloudinary } from "cloudinary";

const uploadWithEffect = async (filePath, effect) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "editfusion/ai",
    resource_type: "image",
    transformation: [{ effect }],
  });
  return result;
};

const uploadWithPrompt = async (filePath, effect, prompt) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "editfusion/ai",
    resource_type: "image",
    transformation: [{ effect: `${effect}:${prompt}` }],
  });
  return result;
};

export const removeBackground = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadWithEffect(req.file.path, "background_removal");
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const enhanceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadWithEffect(req.file.path, "enhance");
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const cartoonifyImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadWithEffect(req.file.path, "cartoonify");
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const animeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadWithEffect(req.file.path, "art:anime");
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const sketchImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadWithEffect(req.file.path, "art:sketch");
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};

export const removeObject = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const prompt = req.body?.prompt;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const result = await uploadWithPrompt(req.file.path, "gen_remove", prompt);
    res.json({ url: result.secure_url });
  } catch (error) {
    next(error);
  }
};
