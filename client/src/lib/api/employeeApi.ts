import { api } from "@/lib/api/axios";

export const inviteEmployee = async (name: string, email: string, designation?: string) => {
  const response = await api.post<{ message: string; user?: { _id: string; name: string; email: string } }>(
    "/auth/invite",
    { name, email, designation },
  );
  return response.data;
};

export type EmployeeItem = {
  _id: string;
  name: string;
  email: string;
  role: "employee";
  designation?: string;
  slug?: string;
  lastActive?: string;
  isVerified: boolean;
  status?: "Active" | "Invited";
  pending?: number;
  completed?: number;
  createdAt?: string;
};

export const getEmployees = async (params?: { search?: string; page?: number; limit?: number; role?: string }) => {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.role) searchParams.set("role", params.role);

  const suffix = searchParams.toString();
  const response = await api.get<{ total: number; page: number; employees: EmployeeItem[] }>(
    `/users${suffix ? `?${suffix}` : ""}`,
  );
  return response.data;
};

export const getEmployeeById = async (id: string) => {
  const response = await api.get<{ _id: string; name: string; email: string; role: string; designation?: string }>(
    `/users/${id}`,
  );
  return response.data;
};

export const getEmployeeBySlug = async (slug: string) => {
  const response = await api.get<{
    _id: string;
    name: string;
    email: string;
    role: string;
    designation?: string;
    slug?: string;
    lastActive?: string;
  }>(`/users/slug/${encodeURIComponent(slug)}`);
  return response.data;
};
