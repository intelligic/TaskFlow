import { api } from "@/lib/api/axios";

export type ActivityUser = {
  _id?: string;
  name?: string;
  email?: string;
  role?: "admin" | "employee" | string;
};

export type ActivityItem = {
  _id?: string;
  user?: ActivityUser;
  action?: string;
  entity?: string;
  entityName?: string;
  createdAt?: string;
  description?: string;
  performedBy?: ActivityUser;
  targetType?: string;
  targetId?: string;
};

export const getActivities = async () => {
  const response = await api.get<ActivityItem[] | { data: ActivityItem[] }>("/activity");
  const payload = response.data;

  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

