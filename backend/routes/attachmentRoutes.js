import express from "express";

import protect from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { getTaskAttachments, uploadAttachment } from "../controllers/attachmentController.js";

const router = express.Router();

router.post(
  "/upload",
  protect,
  upload.single("file"),
  uploadAttachment
);

router.get(
  "/:taskId",
  protect,
  getTaskAttachments
);

export default router;
