import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emitRealtime } from "../utils/realtime.js";

export const createNotification = async ({ userId, message }) => {
  const notification = await Notification.create({
    userId,
    message,
    isRead: false,
  });

  emitRealtime("notificationCreated", notification);
  return notification;
};

export const createNotificationsForAdmins = async ({ message }) => {
  const admins = await User.find({ role: "admin" }).select("_id");
  if (!admins.length) return [];

  const notifications = await Notification.insertMany(
    admins.map((a) => ({ userId: a._id, message, isRead: false })),
  );

  notifications.forEach((n) => emitRealtime("notificationCreated", n));
  return notifications;
};

