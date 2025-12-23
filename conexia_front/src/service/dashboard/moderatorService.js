import { config } from '@/config';
import { fetchWithRefresh } from '../auth/fetchWithRefresh';

/**
 * Servicio para obtener métricas del dashboard de moderador
 */

/**
 * Obtener métricas del dashboard de moderador
 * @returns {Promise<Object>} Datos del dashboard de moderador
 */
export const getModeratorDashboardMetrics = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/moderator`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener métricas de moderador');
  }

  const data = await response.json();
  return data.data;
};

/**
 * Exportar métricas del dashboard de moderador a CSV
 * @returns {Promise<Blob>} Archivo CSV
 */
export const exportModeratorMetricsCSV = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/moderator/export`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al exportar métricas');
  }

  return response.blob();
};
