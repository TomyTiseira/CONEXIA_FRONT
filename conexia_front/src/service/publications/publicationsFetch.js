import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener publicaciones de la comunidad paginadas
export async function getCommunityPublications({ page = 1, limit = 10 } = {}) {
  const url = `${config.API_URL}/publications?page=${page}&limit=${limit}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    credentials: 'include',
  });
  
  const response = await res.json();
  
  if (!res.ok) throw new Error(response.message || 'Error al obtener publicaciones');
  
  // Asegurarse de que la respuesta tiene una estructura válida
  if (!response.data?.publications) {
    response.data = response.data || {};
    response.data.publications = [];
    response.data.pagination = response.data.pagination || {
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      itemsPerPage: limit
    };
  }
  
  return response;
}

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
