import { api } from "@/lib/api/axios";

export type NotificationItem = {
  _id: string;
  userId?: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const getNotifications = async () => {
  const response = await api.get<NotificationItem[] | { data?: NotificationItem[] }>(
    "/notifications",
  );
  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

export const markNotificationRead = async (id: string) => {
  const response = await api.patch<NotificationItem>(`/notifications/${id}/read`);
  return response.data;
};

