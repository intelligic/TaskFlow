import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import { upload } from "../middleware/upload.js";
import { requireTaskAccess } from "../middleware/taskAccess.js";
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

router.use(protect, updateLastActive);

router.post("/", requireRole("admin"), validate(createTaskSchema), createTask);
router.get("/", getTasks);
router.get("/stats/dashboard", getDashboardStats);
router.get("/project/:projectId", getTasksByProject);
router.get("/assigned", getAssignedTasks);
router.get("/archived", requireRole("admin"), getArchivedTasks);
router.post("/:id/comments", addComment);
router.get("/:id/comments", fetchTaskComments);
router.get("/:id", getTaskById);
router.post("/:id/attachments", requireTaskAccess, upload.single("file"), uploadTaskAttachment);
router.patch("/:id/archive", requireRole("admin"), archiveTask);
router.put("/:id", requireRole("admin"), updateTask);
router.delete("/:id", requireRole("admin"), deleteTask);
router.patch("/:id/status", updateTaskStatus);

export default router;
