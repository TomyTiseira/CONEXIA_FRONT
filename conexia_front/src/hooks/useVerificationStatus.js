'use client';

import { useEffect, useState, useCallback } from 'react';
import { getVerificationStatus } from '@/service';

/**
 * Hook para obtener y manejar el estado de verificación del usuario
 * @returns {Object} Estado de verificación y funciones de control
 */
export function useVerificationStatus() {
  const [isVerified, setIsVerified] = useState(false);
  const [latestVerification, setLatestVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getVerificationStatus();
      setIsVerified(response.isVerified || false);
      setLatestVerification(response.latestVerification || null);
    } catch (err) {
      setError(err.message || 'Error al obtener estado de verificación');
      setIsVerified(false);
      setLatestVerification(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    isVerified,
    latestVerification,
    loading,
    error,
    refresh,
  };
}
