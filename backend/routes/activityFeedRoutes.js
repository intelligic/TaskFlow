import express from "express";

import protect from "../middleware/authMiddleware.js";
import { getRecentActivityFeed } from "../controllers/activityController.js";

const router = express.Router();

router.get("/", protect, getRecentActivityFeed);

export default router;

