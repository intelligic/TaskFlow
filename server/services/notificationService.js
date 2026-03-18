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

  const room = workspace ? `workspace:${workspace}` : undefined;
  emitRealtime("notificationCreated", notification, room);
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

  notifications.forEach((n) => {
    const room = n.workspace ? `workspace:${n.workspace}` : undefined;
    emitRealtime("notificationCreated", n, room);
  });
  return notifications;
};
