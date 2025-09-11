import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Cancelar o rechazar solicitud de conexión
export async function cancelConnectionRequest(requestId) {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/connection-request/${requestId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al cancelar/rechazar solicitud de conexión');
  return response;
}
