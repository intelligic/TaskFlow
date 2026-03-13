import axios from 'axios';

export { api } from '@/lib/api/axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const serverMessage = error.response?.data?.message;
    if (serverMessage) return serverMessage;
    if (error.code === 'ERR_NETWORK') return 'Unable to connect to API server.';
  }
  return fallback;
}

