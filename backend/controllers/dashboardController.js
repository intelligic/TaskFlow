import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const [totalProjects, totalTasks, completedTasks, totalEmployees] = await Promise.all([
      Project.countDocuments({}),
      Task.countDocuments({}),
      Task.countDocuments({ status: { $in: ["COMPLETED", "done"] } }),
      User.countDocuments({ role: "employee" }),
    ]);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      totalEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
