import AuditLog from "../models/AuditLog.js";

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
