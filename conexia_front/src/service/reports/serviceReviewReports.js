import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener lista de reseñas de servicios reportadas con conteo de reportes
 * @param {Object} params - Parámetros de búsqueda
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.limit - Límite por página (default: 10)
 * @param {string} params.orderBy - Ordenar por: 'reportCount' | 'lastReportDate' (default: 'reportCount')
 * @returns {Promise<Object>} Lista de reseñas reportadas con paginación
 */
export async function getServiceReviewsWithReports(params = {}) {
  const { page = 1, limit = 10, orderBy = 'reportCount' } = params;
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    orderBy
  });

  const res = await fetchWithRefresh(
    `${config.API_URL}/service-review-reports/list?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener las reseñas reportadas');
  }

  // Extraer data de la respuesta del backend
  const data = response?.data || {};
  return {
    serviceReviews: data.serviceReviews || [],
    pagination: data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
}

/**
 * Obtener reportes de una reseña específica
 * @param {number} serviceReviewId - ID de la reseña
 * @param {Object} params - Parámetros de paginación
 * @param {number} params.page - Número de página (default: 1)
 * @param {number} params.limit - Límite por página (default: 10)
 * @returns {Promise<Object>} Reportes de la reseña con paginación
 */
export async function getServiceReviewReports(serviceReviewId, params = {}) {
  const { page = 1, limit = 10 } = params;
  
  const queryParams = new URLSearchParams({
    serviceReviewId: serviceReviewId.toString(),
    page: page.toString(),
    limit: limit.toString()
  });

  const res = await fetchWithRefresh(
    `${config.API_URL}/service-review-reports?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || 'Error al obtener los reportes de la reseña');
  }

  // Extraer data de la respuesta del backend
  const data = response?.data || {};
  return {
    reports: data.reports || [],
    pagination: data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  };
}
