import { useState, useEffect } from 'react';
import { getModeratorDashboardMetrics } from '@/service/dashboard/moderatorService';

/**
 * Hook para obtener datos del dashboard de moderador
 */
export const useModeratorDashboardData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const metrics = await getModeratorDashboardMetrics();
      setData(metrics);
    } catch (err) {
      console.error('Error al obtener métricas de moderador:', err);
      setError(err.message || 'Error al cargar las métricas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
