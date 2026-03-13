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
  const lower = trimmed.toLowerCase();
  if (lower === "pending") return "pending";
  if (lower === "completed") return "completed";
  if (lower === "closed") return "closed";
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
    if (!req.user?.workspace) {
      return res.status(400).json({ message: "Workspace is required" });
    }

    let targetUserId = req.user.id;
    let assignedToUser = null;

    if (req.user && req.user.role === "admin") {
      if (typeof req.body.assignedTo === "string" && req.body.assignedTo.trim()) {
        assignedToUser = await User.findOne({
          _id: req.body.assignedTo,
          workspace: req.user.workspace,
        }).select("_id email name role");
        if (assignedToUser) targetUserId = assignedToUser._id;
      } else if (typeof req.body.assignee === "string") {
        const assigneeEmail = req.body.assignee.trim().toLowerCase();
        if (assigneeEmail.includes("@")) {
          assignedToUser = await User.findOne({
            email: assigneeEmail,
            workspace: req.user.workspace,
          }).select("_id email name role");
          if (assignedToUser) targetUserId = assignedToUser._id;
        }
      }
    }

    const assigneeLabel =
      typeof req.body.assignee === "string" && req.body.assignee.trim()
        ? req.body.assignee.trim()
        : assignedToUser?.email;

    const task = await Task.create({
      title: req.body?.title,
      description: req.body?.description,
      assignedTo: targetUserId,
      dueDate: req.body?.dueDate,
      tags: Array.isArray(req.body?.tags) ? req.body.tags : [],
      assignee: assigneeLabel,
      status: normalizeStatus(req.body?.status) || undefined,
      userId: targetUserId,
      projectId: req.body?.projectId,
      priority: req.body?.priority,
      createdBy: req.user.id,
      workspace: req.user.workspace,
    });

    if (req.user && req.user.role === "admin" && String(targetUserId) !== String(req.user.id)) {
      await createNotification({
        userId: targetUserId,
        title: "Task assigned",
        type: "TASK_ASSIGNED",
        message: `You have been assigned a task: "${task.title}"`,
        workspace: req.user.workspace,
      });

      await logActivity({
        action: "TASK_ASSIGNED",
        performedBy: req.user.id,
        targetType: "TASK",
        targetId: task._id,
        description: assignedToUser?.email
          ? `Task "${task.title}" assigned to ${assignedToUser.email}`
          : `Task "${task.title}" assigned`,
      });
    }

    await logActivity({
      action: "TASK_CREATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${task.title}" created`,
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
      ? { isArchived: { $ne: true }, workspace: req.user.workspace }
      : {
        workspace: req.user.workspace,
        isArchived: { $ne: true },
        assignedTo: req.user.id,
      };

    if (String(req.query?.archived || "").toLowerCase() === "true") {
      query.isArchived = true;
    }

    if (String(req.query?.assignedTo || "") === "currentUser") {
      query.assignedTo = req.user.id;
    } else if (typeof req.query?.assignedTo === "string" && req.query.assignedTo.trim()) {
      query.assignedTo = req.query.assignedTo.trim();
    }

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
      .populate("assignedTo", "name email designation")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 })
      .lean();

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
    const tasks = await Task.find({
      isArchived: { $ne: true },
      workspace: req.user.workspace,
      assignedTo: req.user.id,
    })
      .populate("projectId", "name description")
      .populate("assignedTo", "name email designation")
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const query = req.user && req.user.role === "admin"
      ? { _id: req.params.id, workspace: req.user.workspace }
      : {
        _id: req.params.id,
        workspace: req.user.workspace,
        assignedTo: req.user.id,
      };

    const task = await Task.findOne(query)
      .populate("projectId", "name description")
      .populate("assignedTo", "name email designation")
      .lean();

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
      ? { _id: req.params.id, workspace: req.user.workspace }
      : {
        _id: req.params.id,
        workspace: req.user.workspace,
        assignedTo: req.user.id,
      };

    const task = await Task.findOneAndUpdate(
      query,
      req.body,
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    emitRealtime("taskUpdated", task);

    await logActivity({
      action: "TASK_UPDATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${task.title}" updated`,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      workspace: req.user.workspace,
      ...(req.user && req.user.role === "admin"
        ? {}
        : { assignedTo: req.user.id }),
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

    const allowedStatuses = new Set([
      "pending",
      "completed",
      "closed",
      "TODO",
      "IN_PROGRESS",
      "REVIEW",
      "COMPLETED",
      "todo",
      "in-progress",
      "done",
    ]);

    if (!status || typeof status !== "string" || !allowedStatuses.has(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const query = req.user && req.user.role === "admin"
      ? { _id: taskId, workspace: req.user.workspace }
      : {
        _id: taskId,
        workspace: req.user.workspace,
        assignedTo: req.user.id,
      };

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

    const statusForRules = (value) => {
      if (value === "pending") return "TODO";
      if (value === "completed" || value === "closed") return "COMPLETED";
      return value;
    };

    const fromForRules = statusForRules(fromStatus);
    const nextForRules = statusForRules(nextStatus);

    if (nextStatus === "closed" && userRole !== "admin") {
      return res.status(403).json({ message: "Only admins can close tasks" });
    }

    if (!["pending", "completed", "closed"].includes(nextStatus)) {
      const allowedTransitions = roleRules[fromForRules] || [];
      if (!allowedTransitions.includes(nextForRules)) {
        return res.status(400).json({ message: "Status transition not allowed" });
      }
    }

    task.status = nextStatus;
    if (nextStatus === "closed") {
      task.isArchived = true;
    }
    await task.save();

    if (nextForRules === "REVIEW") {
      await createNotificationsForAdmins({
        title: "Review required",
        type: "TASK_REVIEW_REQUIRED",
        message: `Task "${task.title}" is awaiting review`,
        workspace: req.user.workspace,
      });
    }

    if (nextForRules === "COMPLETED" && task.userId) {
      await createNotification({
        userId: task.userId,
        title: "Task approved",
        type: "TASK_APPROVED",
        message: `Your task "${task.title}" was approved`,
        workspace: req.user.workspace,
      });
    }

    await logActivity({
      action: "TASK_STATUS_UPDATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${task.title}" status updated to "${nextStatus}"`,
    });

    if (nextStatus === "COMPLETED") {
      await logActivity({
        action: "TASK_COMPLETED",
        performedBy: req.user.id,
        targetType: "TASK",
        targetId: task._id,
        description: `Task "${task.title}" completed`,
      });
    }

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
      workspace: req.user.workspace,
      ...(req.user && req.user.role === "admin" ? {} : { assignedTo: req.user.id }),
    })
      .populate("assignedTo", "name email designation")
      .sort({ createdAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({
      workspace: req.user.workspace,
      assignedTo: req.user.id,
    });

    const todo = await Task.countDocuments({
      assignedTo: req.user.id,
      status: { $in: ["TODO", "todo"] },
      workspace: req.user.workspace,
    });

    const inProgress = await Task.countDocuments({
      assignedTo: req.user.id,
      status: { $in: ["IN_PROGRESS", "in-progress"] },
      workspace: req.user.workspace,
    });

    const done = await Task.countDocuments({
      assignedTo: req.user.id,
      status: { $in: ["COMPLETED", "done", "completed", "closed"] },
      workspace: req.user.workspace,
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

    const task = await Task.findOne({ _id: req.params.id, workspace: req.user.workspace });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const status = normalizeStatus(task.status);
    if (status !== "COMPLETED") {
      return res.status(400).json({ message: "Only COMPLETED tasks can be archived" });
    }

    task.isArchived = true;
    await task.save();

    emitRealtime("taskUpdated", task);

    await logActivity({
      action: "TASK_ARCHIVED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${task.title}" archived`,
    });

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

    const tasks = await Task.find({ isArchived: true, workspace: req.user.workspace })
      .populate("projectId", "name description")
      .populate("assignedTo", "name email designation")
      .sort({ updatedAt: -1 })
      .lean();

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

    const task = req.task
      ? req.task
      : await Task.findOne(
        req.user && req.user.role === "admin"
          ? { _id: req.params.id, workspace: req.user.workspace }
          : { _id: req.params.id, userId: req.user.id, workspace: req.user.workspace },
      );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const attachment = {
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      workspace: req.user.workspace,
    };

    task.attachments = Array.isArray(task.attachments) ? task.attachments : [];
    task.attachments.push(attachment);
    await task.save();

    emitRealtime("fileUploaded", { taskId: task._id, attachment });

    await logActivity({
      action: "TASK_FILE_UPLOADED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `File uploaded for task "${task.title}"`,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
