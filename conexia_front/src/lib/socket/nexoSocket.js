import { io } from 'socket.io-client';
import { config } from '@/config';

let nexoSocket = null;

function getBaseUrl() {
  // API_URL like http://host:port/api -> base http://host:port
  return (config.API_URL || '').replace(/\/?api\/?$/, '');
}

/**
 * Obtiene o crea la instancia del socket de NEXO
 * @returns {Socket} Instancia del socket
 */
export function getNexoSocket() {
  if (nexoSocket && nexoSocket.connected) {
    return nexoSocket;
  }
  
  if (!nexoSocket) {
    const base = getBaseUrl();
    nexoSocket = io(`${base}/chatbot`, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  
  return nexoSocket;
}

/**
 * Desconecta y limpia el socket de NEXO
 */
export function disconnectNexoSocket() {
  if (nexoSocket) {
    nexoSocket.disconnect();
    nexoSocket = null;
  }
}

/**
 * Reconecta el socket de NEXO
 */
export function reconnectNexoSocket() {
  if (nexoSocket && !nexoSocket.connected) {
    nexoSocket.connect();
  }
}
