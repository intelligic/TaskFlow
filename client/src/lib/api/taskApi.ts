import { api } from '@/lib/api/axios';
import { Task, TaskComment, TaskStatus } from '@/types/task';

export const getTasks = async (params?: Record<string, any>) => {
  const response = await api.get<{ tasks: Task[] }>('/tasks', { params });
  return response.data;
};

export const getTaskById = async (id: string) => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: { title: string; description?: string; assignedTo: string; dueDate?: string; tags?: string[] }) => {
  const response = await api.post<Task>('/tasks', data);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const updateTask = async (taskId: string, data: Partial<Task>) => {
  const response = await api.patch<Task>(`/tasks/${taskId}`, data);
  return response.data;
};

export const getArchivedTasks = async () => {
  const response = await api.get<Task[]>("/tasks/archived");
  return response.data;
};

export const getTaskComments = async (taskId: string) => {
  const response = await api.get<{ success: boolean; data: TaskComment[] }>(
    `/tasks/${taskId}/comments`
  );
  return response.data.data || [];
};

export const createTaskComment = async (taskId: string, message: string) => {
  const response = await api.post<{ success: boolean; data: TaskComment }>(
    `/tasks/${taskId}/comments`,
    { message }
  );
  return response.data.data;
};
