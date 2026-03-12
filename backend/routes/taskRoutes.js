import express from "express";

import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/upload.js";
import validate from "../middleware/validate.js";
import { createTaskSchema } from "../validators/taskValidator.js";
import { addComment, fetchTaskComments } from "../controllers/commentController.js";
import {
  archiveTask,
  createTask,
  deleteTask,
  getDashboardStats,
  getAssignedTasks,
  getArchivedTasks,
  getTaskById,
  getTasks,
  getTasksByProject,
  uploadTaskAttachment,
  updateTask,
  updateTaskStatus,
} from "../controllers/taskController.js";

const router = express.Router();

router.post("/", protect, validate(createTaskSchema), createTask);
router.get("/", protect, getTasks);
router.get("/stats/dashboard", protect, getDashboardStats);
router.get("/project/:projectId", protect, getTasksByProject);
router.get("/assigned", protect, getAssignedTasks);
router.get("/archived", protect, getArchivedTasks);
router.post("/:id/comments", protect, addComment);
router.get("/:id/comments", protect, fetchTaskComments);
router.get("/:id", protect, getTaskById);
router.post("/:id/attachments", protect, upload.single("file"), uploadTaskAttachment);
router.patch("/:id/archive", protect, archiveTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.patch("/:id/status", protect, updateTaskStatus);

export default router;
