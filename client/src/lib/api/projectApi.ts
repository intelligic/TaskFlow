import { api } from '@/lib/api/axios';

export type Project = {
  _id: string;
  name: string;
  description?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getProjects = async () => {
  const response = await api.get<Project[]>('projects');
  return response.data;
};

export const getProjectById = async (id: string) => {
  const response = await api.get<Project>(`projects/${id}`);
  return response.data;
};

export const createProject = async (data: Pick<Project, "name" | "description">) => {
  const response = await api.post<Project>('projects', data);
  return response.data;
};
