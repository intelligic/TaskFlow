import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import { inviteEmployee, login, register, setPassword, verifyInvite } from "../controllers/authController.js";
import { getProfile } from "../controllers/profileController.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/invite", protect, updateLastActive, requireRole("admin"), inviteEmployee);
router.get("/verify-invite", verifyInvite);
router.post("/set-password", setPassword);
router.get("/profile", protect, updateLastActive, getProfile);

export default router;
