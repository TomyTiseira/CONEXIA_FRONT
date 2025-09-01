// Obtener publicaciones de la comunidad paginadas
export async function getCommunityPublications({ page = 1, limit = 10 } = {}) {
  const res = await fetchWithRefresh(`${config.API_URL}/publications?page=${page}&limit=${limit}`, {
    method: 'GET',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener publicaciones');
  return response;
}
import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear publicación
export async function createPublication({ description, file, privacy }) {
  const formData = new FormData();
  formData.append('description', description);
  if (file) {
    formData.append('media', file);
  }
  if (privacy) {
    formData.append('privacy', privacy);
  }
  const res = await fetchWithRefresh(`${config.API_URL}/publications/create`, {
    method: 'POST',
    body: formData,
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al crear publicación');
  return response;
}
