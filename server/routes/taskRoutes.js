import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import validate from "../middleware/validate.js";
import { createTaskSchema } from "../validators/taskValidator.js";
import { addComment, fetchTaskComments } from "../controllers/commentController.js";
import {
  createTask,
  deleteTask,
  getDashboardStats,
  getArchivedTasks,
  getTaskById,
  getTasks,
  updateTaskStatus,
  updateTask,
} from "../controllers/taskController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.post("/", requireRole("admin"), validate(createTaskSchema), createTask);
router.get("/", getTasks);
router.get("/stats/dashboard", getDashboardStats);
router.get("/archived", getArchivedTasks);
router.post("/:id/comments", addComment);
router.get("/:id/comments", fetchTaskComments);
router.get("/:id", getTaskById);
router.patch("/:id", requireRole("admin"), updateTask);
router.delete("/:id", requireRole("admin"), deleteTask);
router.patch("/:id/status", updateTaskStatus);

export default router;
