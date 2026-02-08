import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener recomendaciones de conexiones del usuario
 * @returns {Promise<Object>} Respuesta con las recomendaciones ordenadas por match de habilidades y amigos en común
 */
export async function getRecommendations() {
  const res = await fetchWithRefresh(`${config.API_URL}/contacts/recommendations`, {
    method: 'GET',
    credentials: 'include',
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener recomendaciones de conexión');
  return response;
}