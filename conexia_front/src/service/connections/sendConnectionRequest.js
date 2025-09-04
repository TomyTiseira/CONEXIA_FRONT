import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Enviar solicitud de conexión
export async function sendConnectionRequest(receiverId) {
  if (typeof receiverId !== 'number') throw new Error('receiverId must be a number');
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/send-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ receiverId }),
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al enviar solicitud de conexión');
  return response;
}
