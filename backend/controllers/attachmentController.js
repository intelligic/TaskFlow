import Attachment from "../models/Attachment.js";
import { emitRealtime } from "../utils/realtime.js";

export const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const attachment = await Attachment.create({
      task: taskId,
      uploadedBy: req.user.id,
      fileName: req.file.originalname,
      filePath: req.file.path,
    });

    emitRealtime("fileUploaded", attachment);

    res.json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;

    const files = await Attachment.find({ task: taskId })
      .populate("uploadedBy", "name email");

    res.json({
      success: true,
      data: files,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
