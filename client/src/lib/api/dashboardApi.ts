import { api } from '@/lib/api/axios';

export type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  activeTasks?: number;
  totalEmployees?: number;
  activeEmployees?: number;
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get<DashboardStats>('dashboard/stats');
    return response.data;
  } catch {
    return { totalTasks: 0, completedTasks: 0, activeTasks: 0, totalEmployees: 0, activeEmployees: 0 };
  }
};

export type ActivityItem = {
  _id?: string;
  action?: string;
  description?: string;
  createdAt?: string;
};

export const getRecentActivity = async () => {
  try {
    const response = await api.get<ActivityItem[]>('activity');
    return response.data;
  } catch {
    return [];
  }
};
