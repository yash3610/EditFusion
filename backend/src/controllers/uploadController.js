import { uploadImage } from "../services/cloudinary.js";

export const uploadSingleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    const result = await uploadImage(req.file.path, "editfusion/uploads");
    res.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    next(error);
  }
};
