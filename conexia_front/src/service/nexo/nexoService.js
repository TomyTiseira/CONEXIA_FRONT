import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

const API = config.API_URL;

/**
 * Inicializa el estado del chatbot NEXO
 * @returns {Promise<{greeting?: string, conversationId: string, hasHistory: boolean}>}
 */
export async function initializeNexoChat() {
  const url = `${API}/chatbot/initialize`;
  const res = await fetchWithRefresh(url, { 
    method: 'GET', 
    credentials: 'include' 
  });
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al inicializar NEXO');
  }
  
  return json;
}

/**
 * Obtiene el historial de mensajes de una conversación
 * @param {string} conversationId - UUID de la conversación
 * @returns {Promise<{data: Array}>}
 */
export async function getNexoMessages(conversationId) {
  if (!conversationId) {
    throw new Error('conversationId requerido');
  }
  
  const url = `${API}/chatbot/messages/${conversationId}`;
  const res = await fetchWithRefresh(url, { 
    method: 'GET', 
    credentials: 'include' 
  });
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener historial de NEXO');
  }
  
  return json;
}

/**
 * Obtiene todas las conversaciones del usuario (opcional)
 * @returns {Promise<{data: Array}>}
 */
export async function getNexoConversations() {
  const url = `${API}/chatbot/conversations`;
  const res = await fetchWithRefresh(url, { 
    method: 'GET', 
    credentials: 'include' 
  });
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener conversaciones de NEXO');
  }
  
  return json;
}

/**
 * Envía un mensaje (solo para testing, usar WebSocket en producción)
 * @param {string} message - Mensaje a enviar
 * @returns {Promise<any>}
 */
export async function sendNexoMessage(message) {
  const url = `${API}/chatbot/message`;
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message }),
  });
  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al enviar mensaje a NEXO');
  }
  
  return json;
}
