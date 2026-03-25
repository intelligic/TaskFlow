import { api } from '@/lib/api/axios';
import { Task, TaskComment, TaskStatus } from '@/types/task';

export const getTasks = async (params?: Record<string, any>) => {
  try {
    const response = await api.get<{ tasks: Task[] }>('tasks', { params });
    return response.data;
  } catch {
    return { tasks: [] as Task[] };
  }
};

export const getTaskById = async (id: string) => {
  try {
    const response = await api.get<Task>(`tasks/${id}`);
    return response.data;
  } catch {
    return null;
  }
};

export const createTask = async (
  data: { title: string; description?: string; assignedTo: string; dueDate?: string; tags?: string[] },
  files?: File[],
) => {
  try {
    if (files && files.length > 0) {
      const form = new FormData();
      form.append("title", data.title);
      if (data.description) form.append("description", data.description);
      form.append("assignedTo", data.assignedTo);
      if (data.dueDate) form.append("dueDate", data.dueDate);
      if (data.tags && data.tags.length > 0) form.append("tags", JSON.stringify(data.tags));
      files.forEach((file) => form.append("attachments", file));
      const response = await api.post<Task>("tasks", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    }

    const response = await api.post<Task>('tasks', data);
    return response.data;
  } catch {
    return null;
  }
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  try {
    const response = await api.patch<Task>(`tasks/${taskId}/status`, { status });
    return response.data;
  } catch {
    return null;
  }
};

export const updateTask = async (taskId: string, data: Partial<Task>) => {
  try {
    const response = await api.patch<Task>(`tasks/${taskId}`, data);
    return response.data;
  } catch {
    return null;
  }
};

export const deleteTask = async (taskId: string) => {
  try {
    const response = await api.delete<{ message: string }>(`tasks/${taskId}`);
    return response.data;
  } catch {
    return null;
  }
};

export const getArchivedTasks = async () => {
  try {
    const response = await api.get<Task[]>("tasks/archived");
    return response.data;
  } catch {
    return [];
  }
};

export const getTaskComments = async (taskId: string) => {
  try {
    const response = await api.get<{ success: boolean; data: TaskComment[] }>(
      `tasks/${taskId}/comments`
    );
    return response.data.data || [];
  } catch {
    return [];
  }
};

export const createTaskComment = async (taskId: string, message: string) => {
  try {
    const response = await api.post<{ success: boolean; data: TaskComment }>(
      `tasks/${taskId}/comments`,
      { message }
    );
    return response.data.data;
  } catch {
    return null;
  }
};
