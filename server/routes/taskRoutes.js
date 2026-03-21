import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

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

const uploadsDir = path.resolve(process.cwd(), "uploads", "tasks");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const baseRaw = path.basename(file.originalname || "file", ext);
    const base = baseRaw
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${base || "file"}-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
});

const maybeUploadAttachments = (req, res, next) => {
  if (!req.is("multipart/form-data")) return next();
  return upload.array("attachments", 5)(req, res, next);
};

const normalizeTaskBody = (req, _res, next) => {
  if (typeof req.body?.tags === "string") {
    try {
      const parsed = JSON.parse(req.body.tags);
      req.body.tags = Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      req.body.tags = String(req.body.tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  }

  if (typeof req.body?.title === "string") req.body.title = req.body.title.trim();
  if (typeof req.body?.description === "string") req.body.description = req.body.description.trim();
  if (typeof req.body?.assignedTo === "string") req.body.assignedTo = req.body.assignedTo.trim();
  if (req.body?.dueDate === "") delete req.body.dueDate;

  next();
};

router.post("/", requireRole("admin"), maybeUploadAttachments, normalizeTaskBody, validate(createTaskSchema), createTask);
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
