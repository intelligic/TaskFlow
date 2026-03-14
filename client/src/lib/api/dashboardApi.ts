import { api } from '@/lib/api/axios';

export type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  activeTasks?: number;
  totalEmployees?: number;
  activeEmployees?: number;
};

export const getDashboardStats = async () => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export type ActivityItem = {
  _id?: string;
  action?: string;
  description?: string;
  createdAt?: string;
};

export const getRecentActivity = async () => {
  const response = await api.get<ActivityItem[]>('/activity');
  return response.data;
};
