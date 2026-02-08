/**
 * useMyClaims Hook
 * Hook para gestionar los reclamos del usuario
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMyClaims } from '@/service/claims';

export const useMyClaims = (initialFilters = {}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    status: '',
    role: 'all',
    claimId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const fetchClaims = useCallback(async (fetchFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyClaims(fetchFilters);
      
      setClaims(data.claims || []);
      
      // El backend devuelve pagination con: currentPage, totalPages, hasNextPage, hasPreviousPage, totalItems
      setPagination({
        currentPage: data.pagination?.currentPage || 1,
        totalPages: data.pagination?.totalPages || 0,
        hasNextPage: data.pagination?.hasNextPage || false,
        hasPreviousPage: data.pagination?.hasPreviousPage || false,
        totalItems: data.pagination?.totalItems || 0,
      });
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(err.message || 'No pudimos obtener tus reclamos. Por favor, intenta nuevamente.');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims(filters);
  }, [filters, fetchClaims]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset page unless explicitly set
    }));
  }, []);

  const setPage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    fetchClaims(filters);
  }, [filters, fetchClaims]);

  return {
    claims,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    setPage,
    refetch,
  };
};
