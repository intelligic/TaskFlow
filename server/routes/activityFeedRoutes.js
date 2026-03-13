import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import { getRecentActivityFeed } from "../controllers/activityController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.get("/", getRecentActivityFeed);

export default router;
