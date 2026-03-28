import { createComment, getTaskComments } from "../services/commentService.js";
import { emitRealtime } from "../utils/realtime.js";
import Task from "../models/Task.js";
import { createNotification, createNotificationsForAdmins } from "../services/notificationService.js";

const ensureCanAccessTask = async (req, taskId) => {
  if (!taskId) return null;

  if (req.user && req.user.role === "admin") {
    return await Task.findOne({ _id: taskId, workspace: req.user.workspace })
      .select("_id assignedTo title workspace status");
  }

  return await Task.findOne({
    _id: taskId,
    assignedTo: req.user.id,
    workspace: req.user.workspace,
  }).select("_id assignedTo title workspace status");
};

export const addComment = async (req, res) => {
  try {
    const taskId = req.params?.id || req.body?.taskId;
    const message = req.body?.message;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const task = await ensureCanAccessTask(req, taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }
    if (task.status === "archived") {
      return res.status(403).json({
        success: false,
        message: "Archived tasks are read-only",
      });
    }

    const comment = await createComment({
      taskId,
      authorId: req.user.id,
      message: message.trim(),
      workspace: task.workspace,
    });

    const room = comment.workspace ? `workspace:${comment.workspace}` : undefined;
    emitRealtime("newComment", comment, room);

    const taskTitle = task?.title || "a task";

    if (req.user && req.user.role === "admin") {
      if (task?.assignedTo) {
        await createNotification({
          userId: task.assignedTo,
          message: `New comment on task "${taskTitle}"`,
          workspace: task.workspace,
        });
      }
    } else {
      await createNotificationsForAdmins({
        message: `New comment on task "${taskTitle}"`,
        workspace: task.workspace,
      });
    }

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const fetchTaskComments = async (req, res) => {
  try {
    const taskId = req.params?.id || req.params?.taskId;

    const task = await ensureCanAccessTask(req, taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const comments = await getTaskComments(taskId, task.workspace);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
