import express from "express";

import protect from "../middleware/authMiddleware.js";
import updateLastActive from "../middleware/updateLastActive.js";
import requireRole from "../middleware/requireRole.js";
import { getAuditLogs } from "../controllers/auditController.js";

const router = express.Router();

router.use(protect, updateLastActive);

router.get("/", requireRole("admin"), getAuditLogs);

export default router;
