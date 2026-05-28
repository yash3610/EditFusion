import { Router } from "express";
import multer from "multer";
import { uploadSingleImage } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 5_000_000 } });

router.post("/image", requireAuth, upload.single("file"), uploadSingleImage);

export default router;
