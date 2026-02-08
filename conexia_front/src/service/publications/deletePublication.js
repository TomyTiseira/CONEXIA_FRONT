import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export async function deletePublication(id) {
  if (!id) throw new Error('id is required');
  const url = `${config.API_URL}/publications/${id}`;
  const res = await fetchWithRefresh(url, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al eliminar publicación');
  return res.json();
}
