import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

const API = config.API_URL;

// Conversations list
export async function getConversations({ page = 1, limit = 10, search } = {}) {
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (search && String(search).trim().length > 0) qs.set('search', String(search).trim());
  const url = `${API}/messaging/conversations?${qs.toString()}`;
  const res = await fetchWithRefresh(url, { method: 'GET', credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al obtener conversaciones');
  const data = json?.data || { conversations: [], pagination: { currentPage: page, itemsPerPage: limit, totalItems: 0, totalPages: 0, hasNextPage: false } };
  return data;
}

// Messages for a conversation
export async function getConversationMessages({ conversationId, page = 1, limit = 50 }) {
  if (!conversationId) throw new Error('conversationId requerido');
  const url = `${API}/messaging/conversations/${conversationId}/messages?page=${page}&limit=${limit}`;
  const res = await fetchWithRefresh(url, { method: 'GET', credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al obtener mensajes');
  const data = json?.data || { messages: [], pagination: { currentPage: page, itemsPerPage: limit, totalItems: 0, totalPages: 0, hasNextPage: false } };
  return data;
}

// Mark messages as read
export async function markMessagesRead({ conversationId, otherUserId, messageIds }) {
  if (!conversationId) throw new Error('conversationId requerido');
  const url = `${API}/messaging/conversations/${conversationId}/messages/read`;
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ messageIds: messageIds || [], otherUserId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al marcar como leídos');
  return json?.data || { message: 'ok' };
}

// Unread conversations count
export async function getUnreadCount() {
  const url = `${API}/messaging/unread-count`;
  const res = await fetchWithRefresh(url, { method: 'GET', credentials: 'include' });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al obtener no leídos');
  return json?.data || { unreadCount: 0 };
}

// Send text message
export async function sendTextMessage({ receiverId, conversationId, content }) {
  const url = `${API}/messaging/send`;
  const payload = { receiverId, conversationId, type: 'text', content };
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al enviar mensaje');
  return json?.data; // { message, messageId, conversationId }
}

// Send file message (image/pdf)
export async function sendFileMessage({ receiverId, conversationId, file, type }) {
  if (!file) throw new Error('archivo requerido');
  const isImage = type === 'image';
  const isPdf = type === 'pdf';
  if (!isImage && !isPdf) throw new Error('tipo inválido');
  // size rules: image up to 5MB, pdf up to 10MB
  const max = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > max) throw new Error(isImage ? 'Imagen supera 5MB' : 'PDF supera 10MB');

  const url = `${API}/messaging/send`;
  const form = new FormData();
  form.append('receiverId', String(receiverId));
  if (conversationId) form.append('conversationId', String(conversationId));
  form.append('type', type);
  // optional metadata used by backend/socket for notifications
  form.append('fileName', file.name);
  form.append('fileSize', String(file.size));
  form.append('file', file, file.name);

  const res = await fetchWithRefresh(url, { method: 'POST', credentials: 'include', body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Error al enviar archivo');
  return json?.data; // { message, messageId, conversationId }
}
