import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import {
	handleGoogleCallback,
	handleGoogleToken,
} from "../controllers/googleAuthController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google/callback", handleGoogleCallback);
router.post("/google/token", handleGoogleToken);

export default router;
