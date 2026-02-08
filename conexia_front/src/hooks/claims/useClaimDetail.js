/**
 * useClaimDetail Hook
 * Hook para obtener el detalle completo de un reclamo
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClaimDetail } from '@/service/claims';

export const useClaimDetail = (claimId) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchClaimDetail = useCallback(async () => {
    if (!claimId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await getClaimDetail(claimId);
      setClaim(data);
    } catch (err) {
      console.error('Error fetching claim detail:', err);
      setError(err.message || 'Error al cargar el detalle del reclamo');
      setClaim(null);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    fetchClaimDetail();
  }, [fetchClaimDetail]);

  const refetch = useCallback(() => {
    fetchClaimDetail();
  }, [fetchClaimDetail]);

  return {
    claim,
    loading,
    error,
    refetch,
  };
};
