import { Router } from "express";
import { login, register, me, refresh, logout } from "../controllers/authController.js";
import {
	handleGoogleCallback,
	handleGoogleToken,
} from "../controllers/googleAuthController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.post("/refresh", refresh);
router.post("/logout", requireAuth, logout);
router.post("/google/callback", handleGoogleCallback);
router.post("/google/token", handleGoogleToken);

export default router;
