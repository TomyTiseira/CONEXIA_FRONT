import { io } from 'socket.io-client';
import { config } from '@/config';

let socket = null;

function getBaseUrl() {
  // API_URL like http://host:port/api -> base http://host:port
  return (config.API_URL || '').replace(/\/?api\/?$/, '');
}

export function getMessagingSocket() {
  if (socket && socket.connected) return socket;
  if (!socket) {
    const base = getBaseUrl();
    socket = io(`${base}/messaging`, {
      withCredentials: true,
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectMessagingSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
