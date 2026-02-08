import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener servicios reportados (agrupados) con paginación y orden
// orderBy: 'reportCount' | 'lastReportDate'
export async function fetchReportedServices({ page = 1, orderBy = 'reportCount' } = {}) {
  const url = `${config.API_URL}/reports/service?page=${encodeURIComponent(page)}&orderBy=${encodeURIComponent(orderBy)}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener servicios reportados');
  }
  const data = json?.data || {};
  return {
    services: data.services || [],
    pagination: data.pagination || {
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}
