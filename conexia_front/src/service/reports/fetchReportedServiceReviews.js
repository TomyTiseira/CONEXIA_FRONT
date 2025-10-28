import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener reseñas de servicios reportadas (agrupadas) con paginación y orden
 * Sigue el mismo patrón que fetchReportedServices y fetchReportedProjects
 * @param {Object} options - Opciones de consulta
 * @param {number} options.page - Número de página (default: 1)
 * @param {string} options.orderBy - 'reportCount' | 'lastReportDate' (default: 'reportCount')
 */
export async function fetchReportedServiceReviews({ page = 1, orderBy = 'reportCount' } = {}) {
  const url = `${config.API_URL}/service-review-reports?page=${encodeURIComponent(page)}&orderBy=${encodeURIComponent(orderBy)}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener reseñas de servicios reportadas');
  }
  const data = json?.data || {};
  return {
    serviceReviews: data.serviceReviews || [],
    pagination: data.pagination || {
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}
