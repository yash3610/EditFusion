import { Router } from "express";
import multer from "multer";
import {
  removeBackground,
  enhanceImage,
  cartoonifyImage,
  animeImage,
  sketchImage,
  removeObject,
} from "../controllers/aiController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 5_000_000 } });

router.post("/background-remove", requireAuth, upload.single("file"), removeBackground);
router.post("/enhance", requireAuth, upload.single("file"), enhanceImage);
router.post("/cartoon", requireAuth, upload.single("file"), cartoonifyImage);
router.post("/anime", requireAuth, upload.single("file"), animeImage);
router.post("/sketch", requireAuth, upload.single("file"), sketchImage);
router.post("/object-remove", requireAuth, upload.single("file"), removeObject);

export default router;
