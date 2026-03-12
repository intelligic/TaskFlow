import Task from "../models/Task.js";
import logActivity from "../utils/activityLogger.js";
import { createAuditLog } from "../services/auditService.js";
import { workflowRules } from "../utils/workflowRules.js";
import { emitRealtime } from "../utils/realtime.js";
import User from "../models/User.js";
import { createNotification, createNotificationsForAdmins } from "../services/notificationService.js";

const normalizeStatus = (value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  if (upper === "IN-PROGRESS" || upper === "IN_PROGRESS" || trimmed === "in-progress") {
    return "IN_PROGRESS";
  }
  if (upper === "TODO" || trimmed === "todo") return "TODO";
  if (upper === "REVIEW" || trimmed === "review") return "REVIEW";
  if (upper === "COMPLETED" || upper === "DONE" || trimmed === "done") return "COMPLETED";
  return trimmed;
};

export const createTask = async (req, res) => {
  try {
    let targetUserId = req.user.id;

    if (req.user && req.user.role === "admin" && typeof req.body.assignee === "string") {
      const assigneeEmail = req.body.assignee.trim().toLowerCase();
      if (assigneeEmail.includes("@")) {
        const assigneeUser = await User.findOne({ email: assigneeEmail }).select("_id email");
        if (assigneeUser) {
          targetUserId = assigneeUser._id;
        }
      }
    }

    const task = await Task.create({
      ...req.body,
      status: normalizeStatus(req.body?.status) || undefined,
      userId: targetUserId,
    });

    if (req.user && req.user.role === "admin" && String(targetUserId) !== String(req.user.id)) {
      await createNotification({
        userId: targetUserId,
        message: `You have been assigned a task: "${task.title}"`,
      });
    }

    await logActivity({
      action: `Task "${task.title}" created`,
      taskId: task._id,
      projectId: task.projectId,
      userId: req.user.id,
    });
    await createAuditLog({
      actor: req.user.id,
      action: "TASK_CREATED",
      entityType: "TASK",
      entityId: task._id,
      details: { status: task.status },
      ipAddress: req.ip,
    });

    emitRealtime("taskCreated", task);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.max(Number(limit) || 10, 1);

    const query = req.user && req.user.role === "admin"
      ? { isArchived: { $ne: true } }
      : { userId: req.user.id, isArchived: { $ne: true } };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const tasks = await Task.find(query)
      .populate("projectId", "name description")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await Task.countDocuments(query);

    res.json({
      total,
      page: pageNum,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id, isArchived: { $ne: true } })
      .populate("projectId", "name description")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const query = req.user && req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const task = await Task.findOne(query).populate(
      "projectId",
      "name description",
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const query = req.user && req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const task = await Task.findOneAndUpdate(
      query,
      req.body,
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    emitRealtime("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      ...(req.user && req.user.role === "admin" ? {} : { userId: req.user.id }),
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const query = req.user && req.user.role === "admin"
      ? { _id: taskId }
      : { _id: taskId, userId: req.user.id };

    const task = await Task.findOne(query);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const userRole = req.user && req.user.role;
    const roleRules = userRole && workflowRules[userRole];
    if (!roleRules) {
      return res.status(403).json({ message: "Role not allowed" });
    }

    const fromStatus = normalizeStatus(task.status);
    const nextStatus = normalizeStatus(status);
    const allowedTransitions = roleRules[fromStatus] || [];
    if (!allowedTransitions.includes(nextStatus)) {
      return res.status(400).json({ message: "Status transition not allowed" });
    }

    task.status = nextStatus;
    await task.save();

    if (nextStatus === "REVIEW") {
      await createNotificationsForAdmins({
        message: `Task "${task.title}" is awaiting review`,
      });
    }

    if (nextStatus === "COMPLETED" && task.userId) {
      await createNotification({
        userId: task.userId,
        message: `Your task "${task.title}" was approved`,
      });
    }

    await logActivity({
      action: `Task \"${task.title}\" status updated to \"${status}\"`,
      taskId: task._id,
      projectId: task.projectId,
      userId: req.user.id,
    });

    await createAuditLog({
      actor: req.user.id,
      action: "TASK_STATUS_UPDATED",
      entityType: "TASK",
      entityId: task._id,
      details: { from: fromStatus, to: nextStatus },
      ipAddress: req.ip,
    });

    emitRealtime("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.projectId,
      ...(req.user && req.user.role === "admin" ? {} : { userId: req.user.id }),
    }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ userId: req.user.id });

    const todo = await Task.countDocuments({
      userId: req.user.id,
      status: { $in: ["TODO", "todo"] },
    });

    const inProgress = await Task.countDocuments({
      userId: req.user.id,
      status: { $in: ["IN_PROGRESS", "in-progress"] },
    });

    const done = await Task.countDocuments({
      userId: req.user.id,
      status: { $in: ["COMPLETED", "done"] },
    });

    res.json({
      totalTasks,
      todo,
      inProgress,
      done,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const archiveTask = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const status = normalizeStatus(task.status);
    if (status !== "COMPLETED") {
      return res.status(400).json({ message: "Only COMPLETED tasks can be archived" });
    }

    task.isArchived = true;
    await task.save();

    emitRealtime("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArchivedTasks = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const tasks = await Task.find({ isArchived: true })
      .populate("projectId", "name description")
      .sort({ updatedAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadTaskAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const query = req.user && req.user.role === "admin"
      ? { _id: req.params.id }
      : { _id: req.params.id, userId: req.user.id };

    const task = await Task.findOne(query);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachment = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
    };

    task.attachments = Array.isArray(task.attachments) ? task.attachments : [];
    task.attachments.push(attachment);
    await task.save();

    emitRealtime("fileUploaded", { taskId: task._id, attachment });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
