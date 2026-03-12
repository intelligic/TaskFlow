import express from "express";

import protect from "../middleware/authMiddleware.js";
import { addComment, fetchTaskComments } from "../controllers/commentController.js";

const router = express.Router();

router.post("/add", protect, addComment);
router.get("/:taskId", protect, fetchTaskComments);

export default router;
