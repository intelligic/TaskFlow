import Task from "../models/Task.js";
import logActivity from "../utils/activityLogger.js";
import { createAuditLog } from "../services/auditService.js";
import { emitRealtime } from "../utils/realtime.js";
import User from "../models/User.js";
import { createNotification, createNotificationsForAdmins } from "../services/notificationService.js";

/**
 * Admin creates task -> status = pending
 */
export const createTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can create tasks" });
    }

    const { title, description, assignedTo, dueDate, tags } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({ message: "Title and assignedTo are required" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      dueDate,
      tags,
      createdBy: req.user.id,
      workspace: req.user.workspace,
      status: "pending",
    });

    await createNotification({
      userId: assignedTo,
      title: "New Task Assigned",
      type: "TASK_ASSIGNED",
      message: `You have been assigned a new task: "${title}"`,
      workspace: req.user.workspace,
    });

    await logActivity({
      action: "TASK_CREATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${title}" created and assigned`,
    });

    {
      const room = task.workspace ? `workspace:${String(task.workspace)}` : undefined;
      emitRealtime("taskCreated", task, room);
      console.log("[createTask] emitted taskCreated", { room });
    }
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Admin dashboard: createdBy = adminId, status != archived
 * Employee dashboard: assignedTo = employeeId, status != archived
 */
export const getTasks = async (req, res) => {
  try {
    const query = {
      workspace: req.user.workspace,
      status: { $ne: "archived" },
    };

    if (req.user.role === "admin") {
      if (typeof req.query.assignedTo === "string" && req.query.assignedTo.trim()) {
        query.assignedTo = req.query.assignedTo.trim();
      }
    } else {
      query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email designation")
      .populate("createdBy", "name email")
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      workspace: req.user.workspace,
    })
      .populate("assignedTo", "name email designation")
      .populate("createdBy", "name email")
      .populate({
          path: 'comments',
          populate: { path: 'author', select: 'name' }
      })
      .lean();

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Status flow Permissions:
 * Employee: pending -> completed
 * Admin: completed -> closed
 * Employee: closed -> archived
 */
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, workspace: req.user.workspace });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const userRole = req.user.role;
    const currentStatus = task.status;

    let allowed = false;

    if (userRole === "employee") {
      if (currentStatus === "pending" && status === "completed") allowed = true;
      // Allow employees to archive a task that is either closed or completed
      // (some workflows mark completed tasks before admin closes them).
      if ((currentStatus === "closed" || currentStatus === "completed") && status === "archived") allowed = true;
    } else if (userRole === "admin") {
      if (currentStatus === "completed" && (status === "closed" || status === "pending")) allowed = true;
    }

    if (!allowed) {
      console.log("[updateTaskStatus] forbidden transition", {
        userId: req.user.id,
        role: req.user.role,
        taskId: task._id,
        currentStatus,
        attemptedStatus: status,
      });
      return res.status(403).json({ message: "Status transition not allowed for your role" });
    }

    task.status = status;
    await task.save();

    await logActivity({
      action: "TASK_STATUS_UPDATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task status moved to ${status}`,
    });
    {
      const room = task.workspace ? `workspace:${String(task.workspace)}` : undefined;
      emitRealtime("taskUpdated", task, room);
      console.log("[updateTaskStatus] emitted taskUpdated", { room, status: task.status });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can edit tasks" });
    }

    const { title, description, assignedTo, dueDate, tags } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, workspace: req.user.workspace },
      { title, description, assignedTo, dueDate, tags },
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    await logActivity({
      action: "TASK_UPDATED",
      performedBy: req.user.id,
      targetType: "TASK",
      targetId: task._id,
      description: `Task "${task.title}" updated by admin`,
    });

    {
      const room = task.workspace ? `workspace:${String(task.workspace)}` : undefined;
      emitRealtime("taskUpdated", task, room);
      console.log("[updateTask] emitted taskUpdated", { room });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const query = { workspace: req.user.workspace, status: { $ne: "archived" } };
    if (req.user.role !== "admin") {
      query.assignedTo = req.user.id;
    }

    const totalTasks = await Task.countDocuments(query);
    const pending = await Task.countDocuments({ ...query, status: "pending" });
    const completed = await Task.countDocuments({ ...query, status: "completed" });
    const closed = await Task.countDocuments({ ...query, status: "closed" });

    res.json({ totalTasks, pending, completed, closed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArchivedTasks = async (req, res) => {
  try {
    const query = {
        workspace: req.user.workspace,
        status: "archived"
    };
    
    // Explicit visibility requirement: "Visible to both admin and employee"
    // Usually, employees only see their own, admins see all.
    if (req.user.role !== "admin") {
        query.assignedTo = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email designation")
      .populate("createdBy", "name email")
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'name' }
      })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admins can delete tasks" });
    }
    const task = await Task.findOneAndDelete({ _id: req.params.id, workspace: req.user.workspace });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
