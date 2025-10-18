import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear reporte de servicio
export async function createServiceReport({ serviceId, reason, otherReason, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/reports/service`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceId, reason, otherReason, description })
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al crear reporte');
  return response;
}

// Obtener reportes de un servicio
export async function fetchServiceReports(serviceId, page = 1, limit = 10) {
  const res = await fetchWithRefresh(`${config.API_URL}/reports/service?serviceId=${serviceId}&page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) throw new Error('Error al obtener reportes del servicio');
  return response;
}
