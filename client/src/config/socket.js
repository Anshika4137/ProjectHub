import { io } from 'socket.io-client';
import { API_URL } from './api.js';

const socketUrl = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? API_URL : '');
const disabledSocket = { on: () => {}, off: () => {}, emit: () => {}, connect: () => {}, disconnect: () => {} };

// Vercel Functions cannot host persistent Socket.io connections. In production,
// realtime activates only when VITE_SOCKET_URL points to a WebSocket-capable host.
export const socket = socketUrl ? io(socketUrl, { autoConnect: false }) : disabledSocket;

export const connectSocket = (token) => {
  if (!socketUrl || !token) return;
  socket.auth = { token };
  if (!socket.connected) socket.connect();
};
