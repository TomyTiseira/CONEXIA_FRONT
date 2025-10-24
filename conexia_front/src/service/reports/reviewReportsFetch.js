import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Crear reporte de reseña
 * @param {Object} params - Parámetros del reporte
 * @param {number} params.reviewId - ID de la reseña a reportar
 * @param {string} params.reason - Motivo del reporte
 * @param {string} params.description - Descripción detallada del reporte
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function createReviewReport({ reviewId, reason, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/review-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewId, reason, description })
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al crear el reporte de reseña');
  }
  return response;
}

/**
 * Verificar si el usuario ya reportó una reseña
 * @param {number} reviewId - ID de la reseña
 * @returns {Promise<Object>} { hasReported: boolean, report: Object | null }
 */
export async function checkReviewReport(reviewId) {
  const res = await fetchWithRefresh(`${config.API_URL}/review-reports/check/${reviewId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al verificar el reporte');
  }
  return response;
}

/**
 * Obtener todos los reportes de reseñas (solo admin/moderador)
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Página actual
 * @param {number} params.limit - Cantidad de resultados por página
 * @param {string} params.status - Estado del reporte (pending, resolved, rejected)
 * @returns {Promise<Object>} Lista de reportes con paginación
 */
export async function fetchReviewReports({ page = 1, limit = 10, status = '' } = {}) {
  const params = new URLSearchParams();
  params.append('page', page);
  params.append('limit', limit);
  if (status) params.append('status', status);

  const res = await fetchWithRefresh(`${config.API_URL}/review-reports?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener reportes de reseñas');
  }
  return response;
}

/**
 * Obtener detalle de un reporte de reseña (solo admin/moderador)
 * @param {number} reportId - ID del reporte
 * @returns {Promise<Object>} Detalle del reporte
 */
export async function fetchReviewReportDetail(reportId) {
  const res = await fetchWithRefresh(`${config.API_URL}/review-reports/${reportId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener detalle del reporte');
  }
  return response;
}

/**
 * Resolver un reporte de reseña (admin/moderador)
 * @param {number} reportId - ID del reporte
 * @param {string} action - Acción a tomar (approve, reject)
 * @param {string} resolution - Comentario de resolución
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function resolveReviewReport(reportId, action, resolution = '') {
  const res = await fetchWithRefresh(`${config.API_URL}/review-reports/${reportId}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, resolution })
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al resolver el reporte');
  }
  return response;
}

/**
 * Eliminar una reseña reportada (admin/moderador)
 * @param {number} reviewId - ID de la reseña a eliminar
 * @param {string} reason - Razón de la eliminación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function deleteReportedReview(reviewId, reason = '') {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al eliminar la reseña');
  }
  return response;
}
