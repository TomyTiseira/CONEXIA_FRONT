import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener solicitudes de conexión del usuario
export async function getConnectionRequests() {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/requests`, {
    method: 'GET',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener solicitudes de conexión');
  return response;
}
