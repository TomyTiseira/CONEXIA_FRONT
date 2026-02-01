/**
 * useCompliancePolling Hook
 * Hook para polling de compliances pendientes (badge en navbar)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingCompliancesCount } from '@/service/compliances';
import { POLLING_INTERVALS } from '@/constants/compliances';

export const useCompliancePolling = (userId, enabled = true) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchCount = useCallback(async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }

    try {
      const pendingCount = await getPendingCompliancesCount(userId);
      setCount(pendingCount);
      setHasError(false);
    } catch (error) {
      // Fallar silenciosamente - no mostrar error al usuario
      setHasError(true);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [userId, enabled]);

  // Carga inicial
  useEffect(() => {
    fetchCount();
  }, [fetchCount]);

  // Polling
  useEffect(() => {
    if (!enabled || !userId) return;

    const interval = setInterval(() => {
      fetchCount();
    }, POLLING_INTERVALS.BADGE_COUNT);

    return () => clearInterval(interval);
  }, [enabled, userId, fetchCount]);

  return {
    count,
    loading,
    hasError,
    refetch: fetchCount,
  };
};
