'use client';
import { useState, useEffect } from 'react';
import { getAdminDashboardMetrics } from '@/service/dashboard/dashboardService';

/**
 * Hook personalizado para obtener datos del dashboard de admin
 * @returns {Object} { data, isLoading, error, refetch }
 */
export const useAdminDashboardData = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAdminDashboardMetrics();
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching admin dashboard:', err);
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
