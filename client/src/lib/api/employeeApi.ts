import { api } from "@/lib/api/axios";

export const inviteEmployee = async (name: string, email: string) => {
  const response = await api.post<{ message: string; user?: { _id: string; name: string; email: string } }>(
    "/auth/invite",
    { name, email },
  );
  return response.data;
};

