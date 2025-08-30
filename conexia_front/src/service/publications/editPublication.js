import { config } from '@/config';
import { fetchWithRefresh } from '@/service';

export async function editPublication(id, formData) {
  const response = await fetchWithRefresh(`${config.API_URL}/publications/${id}`, {
    method: 'PATCH',
    body: formData,
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Error al editar publicación');
  }
  return response.json();
}
