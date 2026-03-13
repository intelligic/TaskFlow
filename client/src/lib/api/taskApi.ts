import { api } from '@/lib/api/axios';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export type TaskAttachment = {
  fileName?: string;
  fileUrl?: string;
  uploadedBy?: string;
};

export type TaskCommentAuthor = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export type TaskComment = {
  _id?: string;
  task?: string;
  author?: TaskCommentAuthor;
  message?: string;
  createdAt?: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string | { _id: string; name: string; description?: string };
  assignee?: string;
  assignedTo?: string | { _id?: string; name?: string; email?: string; designation?: string };
  createdBy?: string;
  dueDate?: string;
  tags?: string[];
  userId?: string;
  attachments?: TaskAttachment[];
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export const getTasks = async (params?: {
  assignedTo?: "currentUser" | string;
  archived?: boolean;
  status?: string;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.assignedTo) searchParams.set("assignedTo", params.assignedTo);
  if (params?.archived) searchParams.set("archived", "true");
  if (params?.status) searchParams.set("status", params.status);
  const suffix = searchParams.toString();
  const response = await api.get<{ tasks: Task[] } | Task[]>(`/tasks${suffix ? `?${suffix}` : ""}`);
  return response.data;
};

export const getTaskById = async (id: string) => {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (data: Partial<Omit<Task, '_id'>>) => {
  const response = await api.post<Task>('/tasks', data);
  return response.data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const getAssignedTasks = async () => {
  const response = await api.get<{ tasks: Task[] } | Task[]>("/tasks/assigned");
  return response.data;
};

export const archiveTask = async (taskId: string) => {
  const response = await api.patch<Task>(`/tasks/${taskId}/archive`);
  return response.data;
};

export const getArchivedTasks = async () => {
  const response = await api.get<Task[]>("/tasks/archived");
  return response.data;
};

export const uploadTaskAttachment = async (taskId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<Task>(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const getTaskComments = async (taskId: string) => {
  const response = await api.get<TaskComment[] | { success?: boolean; data?: TaskComment[] }>(
    `/tasks/${taskId}/comments`,
  );

  const payload = response.data;
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
};

export const createTaskComment = async (taskId: string, message: string) => {
  const response = await api.post<TaskComment | { success?: boolean; data?: TaskComment }>(
    `/tasks/${taskId}/comments`,
    { message },
  );

  const payload = response.data;
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: TaskComment }).data;
  }
  return payload as TaskComment;
};
