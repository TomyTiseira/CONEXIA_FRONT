import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear publicación
export async function createPublication({ description, file }) {
  const formData = new FormData();
  formData.append('description', description);
  if (file) {
    formData.append('media', file);
  }
  const res = await fetchWithRefresh(`${config.API_URL}/publications/create`, {
    method: 'POST',
    body: formData,
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al crear publicación');
  return response;
}
