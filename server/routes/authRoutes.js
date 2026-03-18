import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import {
  inviteEmployee,
  login,
  logout,
  register,
  setPassword,
  verifyInvite,
  forgotPassword,
  resetPassword,
  resetPasswordWithEmail,
} from "../controllers/authController.js";
import { getProfile } from "../controllers/profileController.js";
import requireRole from "../middleware/requireRole.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/invite", protect, updateLastActive, requireRole("admin"), inviteEmployee);
router.get("/verify-invite", verifyInvite);
router.post("/set-password", setPassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/forgot-password-direct", resetPasswordWithEmail);
router.get("/profile", protect, updateLastActive, getProfile);

export default router;
