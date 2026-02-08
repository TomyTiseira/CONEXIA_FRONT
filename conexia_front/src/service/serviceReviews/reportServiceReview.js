import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Reportar una reseña de servicio
 * @param {Object} data - Datos del reporte
 * @param {number} data.serviceReviewId - ID de la reseña a reportar
 * @param {string} data.reason - Motivo del reporte (predefinido o "Otro")
 * @param {string} [data.otherReason] - Descripción del motivo personalizado (solo si reason es "Otro")
 * @param {string} data.description - Descripción detallada del reporte (obligatorio)
 * @returns {Promise<Object>} El reporte creado
 */
export async function reportServiceReview(data) {
  const res = await fetchWithRefresh(
    `${config.API_URL}/service-review-reports`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  const response = await res.json();

  if (!res.ok) {
    // Manejar errores específicos del backend
    if (res.status === 400 && response.message?.includes('already reported')) {
      throw new Error('Ya has reportado esta reseña anteriormente');
    }
    if (res.status === 404) {
      throw new Error('La reseña no existe');
    }
    throw new Error(response.message || 'Error al reportar la reseña');
  }

  return response;
}
