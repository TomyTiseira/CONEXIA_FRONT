import { config } from '@/config';

/**
 * Obtener una reseña específica por ID
 * @param {number} reviewId - ID de la reseña
 * @returns {Promise<Object>} Reseña completa
 */
export async function getServiceReviewById(reviewId) {
  const response = await fetch(`${config.API_URL}/service-reviews/${reviewId}`, {
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al obtener la reseña');
  }

  return result.data;
}
