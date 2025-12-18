'use client';
import { useState, useEffect } from 'react';
import { getServiceMetrics } from '@/service/dashboard/serviceMetricsService';

/**
 * Hook personalizado para obtener métricas de servicios del usuario
 * @returns {Object} { data, isLoading, error, refetch }
 */
export const useServiceMetrics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getServiceMetrics();
      // El response ya viene parseado como JSON
      setData(response.data || response);
    } catch (err) {
      setError(err.message || 'Error al cargar métricas de servicios');
      console.error('Error fetching service metrics:', err);
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
