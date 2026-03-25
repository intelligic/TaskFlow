import axios from 'axios';

import { logout } from '@/lib/auth';

const resolvedBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

const normalizeApiBase = (base?: string) => {
  if (!base) return base;
  const trimmed = base.replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const fallbackBaseURL =
  process.env.NODE_ENV === 'production' ? 'https://taskflow-serer.onrender.com/api' : 'http://localhost:5000/api';

if (!resolvedBaseURL && process.env.NODE_ENV === 'production') {
  // Avoid throwing during build/SSR; surface as a visible warning instead.
  console.warn('Missing NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL). API requests may fail.');
}

export const api = axios.create({
  baseURL: normalizeApiBase(resolvedBaseURL) || fallbackBaseURL,
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
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
    return Promise.reject(error);
  },
);

