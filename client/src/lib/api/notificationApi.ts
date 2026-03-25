import { api } from "@/lib/api/axios";

export type NotificationItem = {
  _id: string;
  userId?: string;
  title?: string;
  type?: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const getNotifications = async () => {
  try {
    const response = await api.get<NotificationItem[] | { data?: NotificationItem[] }>(
      "notifications",
    );
    const payload = response.data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  } catch {
    return [];
  }
};

export const markNotificationRead = async (id: string) => {
  try {
    const response = await api.patch<NotificationItem>(`notifications/${id}/read`);
    return response.data;
  } catch {
    return null;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    const response = await api.patch<{ message: string }>("notifications/read-all");
    return response.data;
  } catch {
    return null;
  }
};

export const clearNotifications = async () => {
  try {
    const response = await api.delete<{ message: string }>("notifications/clear");
    return response.data;
  } catch {
    return null;
  }
};
