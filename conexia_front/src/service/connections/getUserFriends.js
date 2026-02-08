import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener amigos de un usuario
export async function getUserFriends(userId, page = 1, limit = 12) {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/friends/${userId}?page=${page}&limit=${limit}`, {
    method: 'GET',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener amigos');
  return response.data;
}
