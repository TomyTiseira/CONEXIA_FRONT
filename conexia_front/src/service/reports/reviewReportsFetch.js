import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Crear reporte de reseña
 * @param {Object} params - Parámetros del reporte
 * @param {number} params.userReviewId - ID de la reseña a reportar
 * @param {string} params.reason - Motivo del reporte
 * @param {string} params.otherReason - Razón adicional cuando reason es 'Otro'
 * @param {string} params.description - Descripción detallada del reporte
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function createReviewReport({ userReviewId, reason, otherReason, description }) {
  const body = { userReviewId, reason, description };
  if (reason === 'Otro' && otherReason) {
    body.otherReason = otherReason;
  }
  
  const res = await fetchWithRefresh(`${config.API_URL}/reports/user-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al crear el reporte de reseña');
  }
  return response;
}

/**
 * Obtener todos los reportes de reseñas agrupados (solo admin/moderador)
 * @param {Object} params - Parámetros de consulta
 * @param {number} params.page - Página actual
 * @param {string} params.orderBy - Ordenar por 'reportCount' o 'lastReportDate'
 * @returns {Promise<Object>} Lista de reseñas reportadas con paginación
 */
export async function fetchReportedReviews({ page = 1, orderBy = 'reportCount' } = {}) {
  const res = await fetchWithRefresh(`${config.API_URL}/reports/user-review?page=${page}&orderBy=${orderBy}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener reseñas reportadas');
  }
  return response;
}

/**
 * Obtener reportes de una reseña específica (solo admin/moderador)
 * @param {number} userReviewId - ID de la reseña
 * @param {number} page - Página actual
 * @returns {Promise<Object>} Lista de reportes con paginación
 */
export async function fetchReviewReports(userReviewId, page = 1) {
  const res = await fetchWithRefresh(`${config.API_URL}/reports/user-review/${userReviewId}?page=${page}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener reportes de la reseña');
  }
  return response;
}
