import { fetchWithRefresh } from '../auth/fetchWithRefresh';
import { config } from '@/config';

/**
 * Obtiene las métricas de servicios del usuario actual
 * @returns {Promise} Promise con las métricas de servicios
 */
export const getServiceMetrics = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/user/services`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al cargar métricas de servicios' }));
    throw new Error(errorData.message || 'Error al cargar métricas de servicios');
  }

  return response.json();
};

/**
 * Exporta las métricas de servicios a CSV
 * @returns {Promise<Blob>} Promise con el archivo CSV
 */
export const exportServiceMetricsCSV = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/user/services/export`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al exportar métricas' }));
    throw new Error(errorData.message || 'Error al exportar métricas de servicios');
  }

  return response.blob();
};
