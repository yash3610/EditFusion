import { Router } from "express";
import multer from "multer";
import {
	convertDocument,
	convertPdfToOffice,
	convertBatch,
} from "../controllers/convertController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15_000_000 } });

router.post("/docx", requireAuth, upload.single("file"), convertDocument);
router.post("/pptx", requireAuth, upload.single("file"), convertDocument);
router.post("/xlsx", requireAuth, upload.single("file"), convertDocument);
router.post("/pdf-to/:target", requireAuth, upload.single("file"), convertPdfToOffice);
router.post("/batch", requireAuth, upload.array("files", 15), convertBatch);

export default router;
