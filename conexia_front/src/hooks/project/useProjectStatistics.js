'use client';
import { useState, useEffect, useCallback } from 'react';
import { getProjectStatistics } from '@/service/project/projectFetch';

/**
 * Hook personalizado para obtener estadísticas de un proyecto
 * @param {number} projectId - ID del proyecto
 * @returns {Object} { data, isLoading, error, refetch }
 */
export const useProjectStatistics = (projectId) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!projectId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await getProjectStatistics(projectId);
      setData(response.data);
    } catch (err) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Error fetching project statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
