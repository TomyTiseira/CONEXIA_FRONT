import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Eliminar un contacto (relación de amistad establecida)
export async function deleteContact(contactId) {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/friends/${contactId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al eliminar contacto');
  return response;
}
