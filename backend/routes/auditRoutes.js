import express from "express";

import protect from "../middleware/authMiddleware.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = express.Router();

router.get("/", protect, getAuditLogs);

export default router;
