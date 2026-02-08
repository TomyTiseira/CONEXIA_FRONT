import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener reseñas de servicios reportadas (agrupadas) con paginación y orden
 * Sigue el mismo patrón que fetchReportedServices y fetchReportedProjects
 * @param {Object} options - Opciones de consulta
 * @param {number} options.page - Número de página (default: 1)
 * @param {number} options.limit - Resultados por página (default: 10)
 * @param {string} options.orderBy - 'reportCount' | 'lastReportDate' (default: 'reportCount')
 */
export async function fetchReportedServiceReviews({ 
  page = 1, 
  limit = 10, 
  orderBy = 'reportCount' 
} = {}) {
  const url = `${config.API_URL}/service-review-reports?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}&orderBy=${encodeURIComponent(orderBy)}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener reseñas reportadas');
  }

  const data = json?.data || {};
  
  return {
    serviceReviews: data.serviceReviews || [],
    pagination: data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}

/**
 * Obtener reportes de una reseña de servicio específica
 * Sigue el mismo patrón que fetchProjectReports y fetchPublicationReports
 * @param {number} serviceReviewId - ID de la reseña
 * @param {number} page - Número de página (default: 1)
 * @param {number} limit - Resultados por página (default: 10)
 */
export async function fetchServiceReviewReportsDetail(serviceReviewId, page = 1, limit = 10) {
  const url = `${config.API_URL}/service-review-reports?serviceReviewId=${encodeURIComponent(serviceReviewId)}&page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener reportes de la reseña');
  }

  const data = json?.data || {};
  
  return {
    reports: data.reports || [],
    pagination: data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
  };
}
