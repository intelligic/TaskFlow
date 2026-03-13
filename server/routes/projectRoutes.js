import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import { createProject, getProjectById, getProjects } from "../controllers/projectController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.post("/", requireRole("admin"), createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

export default router;
