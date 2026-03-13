import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5000');

export const socket = io(SOCKET_URL ?? undefined, {
  autoConnect: false,
});
