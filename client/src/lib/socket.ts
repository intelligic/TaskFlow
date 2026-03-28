import { io } from 'socket.io-client';
import { getToken } from '@/lib/auth';

const rawSocketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL;

const normalizeSocketUrl = (value?: string) => {
  if (!value) return value;
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed.replace(/\/api$/, '') : trimmed;
};

const SOCKET_URL = normalizeSocketUrl(rawSocketUrl);

export const socket = io(SOCKET_URL ?? undefined, {
  autoConnect: false,
  withCredentials: true,
  // Attach JWT in handshake so sockets can authenticate even when third-party cookies are blocked.
  auth: (cb) => {
    const token = getToken();
    cb(token ? { token } : {});
  },
});

const shouldLogSocket = process.env.NODE_ENV !== 'production';

// Helpful client-side logs for socket lifecycle (dev only).
if (shouldLogSocket) {
  socket.on('connect', () => {
    console.info('[socket] connected', socket.id);
  });
  socket.on('disconnect', (reason) => {
    console.info('[socket] disconnected', reason);
  });
  socket.on('connect_error', (err) => {
    // Avoid triggering the Next.js dev overlay for expected local connectivity blips.
    console.warn('[socket] connect_error', err);
  });
}
