import Task from "../models/Task.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role === "admin") {
      const [totalTasks, completedTasks, activeTasks, totalEmployees, activeEmployees] = await Promise.all([
        Task.countDocuments({ 
          workspace: req.user.workspace, 
          status: { $ne: "archived" } 
        }),
        Task.countDocuments({
          status: { $in: ["completed", "closed", "archived"] },
          workspace: req.user.workspace,
        }),
        Task.countDocuments({
          status: "pending",
          workspace: req.user.workspace,
        }),
        User.countDocuments({ role: "employee", workspace: req.user.workspace }),
        User.countDocuments({ role: "employee", workspace: req.user.workspace, isOnline: true }),
      ]);

      return res.json({
        totalTasks,
        completedTasks,
        activeTasks,
        totalEmployees,
        activeEmployees,
      });
    }

    // Employee Stats
    const [totalTasks, completedTasks] = await Promise.all([
      Task.countDocuments({
        assignedTo: req.user.id,
        status: { $ne: "archived" },
        workspace: req.user.workspace,
      }),
      Task.countDocuments({
        assignedTo: req.user.id,
        status: { $in: ["completed", "closed", "archived"] },
        workspace: req.user.workspace,
      }),
    ]);

    res.json({
      totalTasks,
      completedTasks,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
