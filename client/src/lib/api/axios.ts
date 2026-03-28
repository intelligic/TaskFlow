import axios from 'axios';

import { getToken, logout } from '@/lib/auth';
import { toast } from '@/components/ui/toast';

const resolvedBaseURL = process.env.NEXT_PUBLIC_API_URL;

const normalizeApiBase = (base?: string) => {
  if (!base) return base;
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

if (!resolvedBaseURL) {
  // Avoid throwing during build/SSR; surface as a visible warning instead.
  console.warn('Missing NEXT_PUBLIC_API_URL. API requests may fail.');
}

export const api = axios.create({
  baseURL: normalizeApiBase(resolvedBaseURL),
  timeout: 15000,
  withCredentials: true,
});

const shouldSkipToast = (config?: { headers?: Record<string, unknown> }) => {
  const value = config?.headers?.['x-skip-toast'];
  return value === true || value === 'true' || value === '1';
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.code === 'ERR_NETWORK') return 'Unable to connect to API server.';
  }
  return fallback;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!shouldSkipToast(response.config)) {
      const method = String(response.config?.method || '').toLowerCase();
      const isMutation = method === 'post' || method === 'put' || method === 'patch' || method === 'delete';
      const url = String(response.config?.url || '');
      const isAuthRoute = url.includes('/auth/');
      const message = response?.data?.message;
      if (isMutation && !isAuthRoute) {
        if (typeof message === 'string' && message.trim()) {
          toast.success(message.trim());
        } else {
          const fallback =
            method === 'delete'
              ? 'Deleted successfully.'
              : method === 'post'
                ? 'Saved successfully.'
                : 'Updated successfully.';
          toast.success(fallback);
        }
      }
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = String(error?.config?.url || "");
      if (requestUrl.includes("auth/profile")) {
        // Treat unauthenticated profile checks as a normal "not logged in" state.
        return Promise.resolve({ ...error.response, data: null });
      }
      if (typeof window !== 'undefined') {
        const path = window.location.pathname || '';
        const isAuthPage =
          path === '/login' ||
          path === '/register' ||
          path === '/set-password' ||
          path === '/reset-password' ||
          path === '/employee-verify';
        if (!isAuthPage) {
          logout();
        }
      } else {
        logout();
      }
    }
    if (!shouldSkipToast(error?.config)) {
      const message = extractErrorMessage(error, 'Request failed.');
      if (message) toast.error(message);
    }
    return Promise.reject(error);
  },
);
