import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import {
  createNotificationHandler,
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  clearNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.get("/", getUserNotifications);
router.post("/", createNotificationHandler);
router.patch("/read-all", markAllNotificationsRead);
router.delete("/clear", clearNotifications);
router.patch("/:id/read", markNotificationRead);

export default router;
