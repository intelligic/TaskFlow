import Task from "../models/Task.js";

export const requireTaskAccess = async (req, res, next) => {
  try {
    const taskId = req.params?.id;
    if (!taskId) return res.status(400).json({ message: "Task id is required" });

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

    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
