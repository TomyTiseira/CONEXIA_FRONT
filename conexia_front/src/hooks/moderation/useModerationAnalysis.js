import { useState, useEffect, useCallback } from 'react';
import { getModerationResults } from '@/service/moderation';

/**
 * Hook para gestionar el estado de los análisis de moderación
 * @param {Object} initialParams - Parámetros iniciales de consulta
 */
export function useModerationAnalysis(initialParams = {}) {
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    resolved: undefined,
    classification: undefined,
    ...initialParams,
  });

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getModerationResults(filters);
      setResults(response.data || []);
      setMeta(response.meta || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      setError(err.message || 'Error al cargar resultados');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Resetear a página 1 si cambian los filtros (excepto si es cambio de página)
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const refresh = () => {
    loadResults();
  };

  return {
    results,
    meta,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
  };
}
