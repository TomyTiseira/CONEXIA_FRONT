import { fetchWithRefresh } from '../auth/fetchWithRefresh';
import { config } from '@/config';

/**
 * Obtener métricas del dashboard para usuario regular
 * @returns {Promise<UserDashboardData>}
 */
export const getUserDashboardMetrics = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al cargar métricas' }));
    throw new Error(errorData.message || 'Error al cargar métricas del dashboard');
  }

  return response.json();
};

/**
 * Obtener métricas del dashboard para admin/moderador
 * @returns {Promise<AdminDashboardData>}
 */
export const getAdminDashboardMetrics = async () => {
  const response = await fetchWithRefresh(`${config.API_URL}/dashboard/admin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error al cargar métricas' }));
    throw new Error(errorData.message || 'Error al cargar métricas del dashboard');
  }

  return response.json();
};
