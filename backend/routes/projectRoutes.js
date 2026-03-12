import express from "express";

import protect from "../middleware/authMiddleware.js";
import requireRole from "../middleware/requireRole.js";
import { createProject, getProjectById, getProjects } from "../controllers/projectController.js";

const router = express.Router();

router.post("/", protect, requireRole("admin"), createProject);
router.get("/", protect, getProjects);
router.get("/:id", protect, getProjectById);

export default router;
