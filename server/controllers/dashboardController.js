import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [totalProjects, totalTasks, completedTasks, activeTasks, totalEmployees] = await Promise.all([
      Project.countDocuments({ workspace: req.user.workspace }),
      Task.countDocuments({ workspace: req.user.workspace }),
      Task.countDocuments({
        status: { $in: ["COMPLETED", "completed", "done", "closed"] },
        workspace: req.user.workspace,
      }),
      Task.countDocuments({
        status: { $nin: ["COMPLETED", "completed", "done", "closed"] },
        workspace: req.user.workspace,
      }),
      User.countDocuments({ role: "employee", workspace: req.user.workspace }),
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      activeTasks,
      totalEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
