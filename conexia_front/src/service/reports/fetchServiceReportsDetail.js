import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Obtener reportes de un servicio específico
export async function fetchServiceReportsDetail(serviceId, page = 1) {
  const url = `${config.API_URL}/reports/service/${encodeURIComponent(serviceId)}?page=${encodeURIComponent(page)}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener reportes del servicio');
  }
  const data = json?.data || {};
  return {
    reports: data.reports || [],
    pagination: data.pagination || {
      page: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}
