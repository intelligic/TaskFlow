import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import { getEmployees, getUserById, getUserBySlug, updateOnlineStatus } from "../controllers/userController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.patch("/status", updateOnlineStatus);
router.get("/employees", requireRole("admin"), getEmployees);
router.get("/", requireRole("admin"), getEmployees);
router.get("/slug/:slug", requireRole("admin"), getUserBySlug);
router.get("/:id", requireRole("admin"), getUserById);

export default router;
