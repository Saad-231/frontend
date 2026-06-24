import { io } from 'socket.io-client';

let socket = null;

/**
 * Lazily creates (and reuses) a single Socket.io client connection
 * for the whole app lifetime.
 */
export function getSocket() {
  if (!socket) {
    socket = io('https://backend-ivory-nine-55.vercel.app/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socket;
}
