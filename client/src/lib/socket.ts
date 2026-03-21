import { io } from 'socket.io-client';

const rawSocketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5000');

const normalizeSocketUrl = (value?: string) => {
  if (!value) return value;
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.replace(/\/api$/, '') : trimmed;
};

const SOCKET_URL = normalizeSocketUrl(rawSocketUrl);

export const socket = io(SOCKET_URL ?? undefined, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
});

// Helpful client-side logs for socket lifecycle to aid debugging
socket.on('connect', () => {
  console.info('[socket] connected', socket.id);
});
socket.on('disconnect', (reason) => {
  console.info('[socket] disconnected', reason);
});
socket.on('connect_error', (err) => {
  console.error('[socket] connect_error', err);
});
