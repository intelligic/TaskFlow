import express from "express";

import protect from "../middleware/authMiddleware.js";
import {
  createNotificationHandler,
  getUserNotifications,
  markNotificationRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.post("/", protect, createNotificationHandler);
router.patch("/:id/read", protect, markNotificationRead);

export default router;

