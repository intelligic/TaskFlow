import AuditLog from "../models/AuditLog.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      entityType,
      entityId,
      actor,
      from,
      to,
    } = req.query;

    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const query = {};

    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin) {
      query.actor = req.user.id;
    } else if (actor) {
      query.actor = actor;
    }

    if (action) {
      query.action = { $regex: action, $options: "i" };
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (entityId) {
      query.entityId = entityId;
    }

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const logs = await AuditLog.find(query)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await AuditLog.countDocuments(query);

    res.json({
      total,
      page: pageNum,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSegregationReport = async (req, res) => {
  try {
    const workspace = req.user.workspace;

    const employees = await User.find({ workspace, role: "employee" })
      .select("_id name email")
      .lean();

    const employeeIds = new Set(employees.map((e) => String(e._id)));

    const tasks = await Task.find({ workspace })
      .select("_id title assignedTo status createdAt")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    const byEmployee = {};
    employees.forEach((emp) => {
      byEmployee[String(emp._id)] = { employee: emp, count: 0, recentTasks: [] };
    });

    const unassigned = [];
    const unknownAssignee = [];

    tasks.forEach((task) => {
      const assigned = task.assignedTo;
      if (!assigned) {
        unassigned.push(task);
        return;
      }

      const assignedId = String(assigned._id || assigned);
      if (!employeeIds.has(assignedId)) {
        unknownAssignee.push(task);
        return;
      }

      const bucket = byEmployee[assignedId];
      bucket.count += 1;
      if (bucket.recentTasks.length < 5) {
        bucket.recentTasks.push({
          _id: task._id,
          title: task.title,
          status: task.status,
          createdAt: task.createdAt,
        });
      }
    });

    res.json({
      workspace,
      totals: {
        employees: employees.length,
        tasks: tasks.length,
        unassigned: unassigned.length,
        unknownAssignee: unknownAssignee.length,
      },
      byEmployee: Object.values(byEmployee),
      unassignedTasks: unassigned.slice(0, 10),
      unknownAssigneeTasks: unknownAssignee.slice(0, 10),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
