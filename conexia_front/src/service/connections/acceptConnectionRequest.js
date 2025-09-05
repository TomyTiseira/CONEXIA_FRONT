import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Aceptar solicitud de conexión
export async function acceptConnectionRequest(requestId) {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/accept-request`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requestId }),
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al aceptar solicitud de conexión');
  return response;
}
