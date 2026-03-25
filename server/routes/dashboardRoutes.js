import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.get("/", getDashboardStats);
router.get("/stats", getDashboardStats);

export default router;
