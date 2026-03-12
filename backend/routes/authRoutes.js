import express from "express";

import protect from "../middleware/authMiddleware.js";
import { inviteEmployee, login, register, setPassword, verifyInvite } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/invite", protect, inviteEmployee);
router.get("/verify-invite", verifyInvite);
router.post("/set-password", setPassword);

export default router;
