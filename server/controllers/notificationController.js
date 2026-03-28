import Notification from "../models/Notification.js";

const allowedTypes = new Set([
  "SYSTEM",
  "TASK_ASSIGNED",
  "TASK_STATUS_CHANGED",
  "TASK_REVIEW_REQUIRED",
  "TASK_APPROVED",
]);

export const createNotificationHandler = async (req, res) => {
  try {
    const { userId, title, type, message } = req.body || {};

    const targetUserId = req.user && req.user.role === "admin" && userId ? userId : req.user.id;
    const workspace = req.user?.workspace;
    if (!workspace) {
      return res.status(400).json({ message: "Workspace is required" });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (type && (typeof type !== "string" || !allowedTypes.has(type))) {
      return res.status(400).json({ message: "Invalid notification type" });
    }

    const notification = await Notification.create({
      userId: targetUserId,
      workspace,
      title: typeof title === "string" ? title.trim().slice(0, 120) : "",
      type: typeof type === "string" ? type : "SYSTEM",
      message: message.trim(),
      isRead: false,
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error("API Error: /api/notifications (create)", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    if (!Notification || typeof Notification.find !== "function") {
      return res.status(200).json([]);
    }

    if (!req.user || !req.user.id) {
      return res.status(200).json([]);
    }

    const notifications = await Notification.find({
      userId: req.user.id,
      workspace: req.user.workspace,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(Array.isArray(notifications) ? notifications : []);
  } catch (error) {
    console.error("API Error: /api/notifications", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, workspace: req.user.workspace },
      { isRead: true },
      { returnDocument: "after" },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("API Error: /api/notifications/:id/read", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, workspace: req.user.workspace, isRead: false },
      { isRead: true },
    );
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("API Error: /api/notifications/read", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      userId: req.user.id,
      workspace: req.user.workspace,
    });
    res.json({ message: "Notifications cleared" });
  } catch (error) {
    console.error("API Error: /api/notifications/clear", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
