import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener solicitudes de conexión enviadas por el usuario
export async function getSentConnectionRequests() {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/sent-requests`, {
    method: 'GET',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener solicitudes de conexión enviadas');
  return response;
}
