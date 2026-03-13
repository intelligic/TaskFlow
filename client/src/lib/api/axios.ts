import axios from 'axios';

import { getToken, logout } from '@/lib/auth';

const resolvedBaseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

const fallbackBaseURL =
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api';

if (!resolvedBaseURL && process.env.NODE_ENV === 'production') {
  // Avoid throwing during build/SSR; surface as a visible warning instead.
  console.warn('Missing NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL). API requests may fail.');
}

export const api = axios.create({
  baseURL: resolvedBaseURL || fallbackBaseURL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  },
);
