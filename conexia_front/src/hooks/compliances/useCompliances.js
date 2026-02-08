/**
 * useCompliances Hook
 * Hook para gestionar lista de compliances con filtros y polling
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCompliances } from '@/service/compliances';
import { POLLING_INTERVALS, PAGINATION } from '@/constants/compliances';

export const useCompliances = (initialFilters = {}, enablePolling = false) => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialFilters.page || PAGINATION.DEFAULT_PAGE,
    limit: initialFilters.limit || PAGINATION.DEFAULT_LIMIT,
    total: 0,
    totalPages: 0,
  });

  const fetchCompliances = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getCompliances({
        ...initialFilters,
        ...filters,
        page: filters.page || pagination.page,
        limit: filters.limit || pagination.limit,
      });

      setCompliances(result.data || []);
      setPagination({
        page: result.page || 1,
        limit: result.limit || PAGINATION.DEFAULT_LIMIT,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      });
    } catch (err) {
      console.error('Error fetching compliances:', err);
      setError(err.message || 'Error al cargar cumplimientos');
    } finally {
      setLoading(false);
    }
  }, [initialFilters, pagination.page, pagination.limit]);

  // Carga inicial
  useEffect(() => {
    fetchCompliances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling automático
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchCompliances();
    }, POLLING_INTERVALS.COMPLIANCES_LIST);

    return () => clearInterval(interval);
  }, [enablePolling, fetchCompliances]);

  const refetch = useCallback((filters = {}) => {
    return fetchCompliances(filters);
  }, [fetchCompliances]);

  const setPage = useCallback((page) => {
    return fetchCompliances({ page });
  }, [fetchCompliances]);

  const setLimit = useCallback((limit) => {
    return fetchCompliances({ limit, page: 1 });
  }, [fetchCompliances]);

  return {
    compliances,
    loading,
    error,
    pagination,
    refetch,
    setPage,
    setLimit,
  };
};
