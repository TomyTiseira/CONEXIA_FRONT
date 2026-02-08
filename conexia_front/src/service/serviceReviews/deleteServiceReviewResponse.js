import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Eliminar la respuesta del dueño del servicio a una reseña
 * @param {number} reviewId - ID de la reseña
 * @returns {Promise<Object>} La reseña actualizada sin respuesta
 */
export async function deleteServiceReviewResponse(reviewId) {
  const res = await fetchWithRefresh(
    `${config.API_URL}/service-reviews/${reviewId}/response`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || 'Error al eliminar la respuesta');
  }

  return response;
}
