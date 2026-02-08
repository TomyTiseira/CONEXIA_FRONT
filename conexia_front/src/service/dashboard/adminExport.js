import { fetchWithRefresh } from '../auth/fetchWithRefresh';
import { config } from '@/config';

/**
 * Exportar métricas de admin a CSV
 * @returns {Promise<Blob>}
 */
export const exportAdminMetricsCSV = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/admin/export`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al exportar métricas' }));
    throw new Error(errorData.message || 'Error al exportar métricas');
  }

  return response.blob();
};
