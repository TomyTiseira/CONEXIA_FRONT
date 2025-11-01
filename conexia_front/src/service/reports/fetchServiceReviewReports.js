import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener reportes de una reseña de servicio específica
 * Sigue el mismo patrón que fetchProjectReports y fetchPublicationReports
 * @param {number} serviceReviewId - ID de la reseña
 * @param {number} page - Número de página (default: 1)
 */
export async function fetchServiceReviewReports(serviceReviewId, page = 1) {
  const url = `${config.API_URL}/service-review-reports?serviceReviewId=${encodeURIComponent(serviceReviewId)}&page=${encodeURIComponent(page)}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener reportes de la reseña');
  }
  return json;
}
