import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emitRealtime } from "../utils/realtime.js";

export const createNotification = async ({
  userId,
  title = "",
  type = "SYSTEM",
  message,
  workspace,
}) => {
  const notification = await Notification.create({
    userId,
    workspace,
    title,
    type,
    message,
    isRead: false,
  });

  emitRealtime("notificationCreated", notification);
  return notification;
};

export const createNotificationsForAdmins = async ({
  title = "",
  type = "SYSTEM",
  message,
  workspace,
}) => {
  const admins = await User.find({ role: "admin", workspace }).select("_id");
  if (!admins.length) return [];

  const notifications = await Notification.insertMany(
    admins.map((a) => ({
      userId: a._id,
      workspace,
      title,
      type,
      message,
      isRead: false,
    })),
  );

  notifications.forEach((n) => emitRealtime("notificationCreated", n));
  return notifications;
};
