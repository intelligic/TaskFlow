import { api } from '@/lib/api/axios';
import { setToken } from '@/lib/auth';

export type LoginResponse = {
  token: string;
  user?: unknown;
};

export type RegisterResponse = {
  token?: string;
  user?: {
    role?: 'admin' | 'employee';
  };
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>('auth/login', { email, password });
    if (response.data?.token) setToken(response.data.token);
    return response.data;
  } catch {
    return null;
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  workspaceName?: string,
) => {
  const response = await api.post<RegisterResponse>('auth/register', {
    name,
    email,
    password,
    workspaceName,
  });
  if (response.data?.token) setToken(response.data.token);
  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await api.get<{
      _id?: string;
      name?: string;
      email?: string;
      role?: "admin" | "employee";
      designation?: string;
      slug?: string;
      lastActive?: string;
      workspace?: { _id: string; name: string };
      isOnline?: boolean;
      permissions?: {
        role?: "admin" | "employee";
        canAccess?: string[];
        canManage?: string[];
      };
    }>('auth/profile');
    return response.data || null;
  } catch {
    return null;
  }
};

export const verifyInviteToken = async (token: string) => {
  try {
    const response = await api.get<{
      valid: boolean;
      user?: { name?: string; email?: string; designation?: string };
    }>(
      `auth/verify-invite?token=${encodeURIComponent(token)}`,
    );
    return response.data;
  } catch {
    return { valid: false };
  }
};

export const setEmployeePassword = async (token: string, password: string, name?: string, designation?: string) => {
  try {
    const response = await api.post<{ message: string }>("auth/set-password", {
      token,
      password,
      name,
      designation,
    });
    return response.data;
  } catch {
    return null;
  }
};

export const resetPasswordWithEmail = async (email: string, password: string, confirmPassword: string) => {
  try {
    const response = await api.post<{ message: string }>("auth/forgot-password-direct", {
      email,
      password,
      confirmPassword,
    });
    return response.data;
  } catch {
    return null;
  }
};
