/**
 * useClaims Hook
 * Hook para cargar y gestionar reclamos de un hiring
 */

import { useState, useEffect, useCallback } from 'react';
import { getClaimsByHiring } from '@/service/claims';

/**
 * Hook para obtener reclamos de un hiring
 * @param {number} hiringId - ID de la contratación
 * @param {string} token - Token de autenticación
 * @returns {Object} - Estado y funciones
 */
export const useClaims = (hiringId, token) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClaims = useCallback(async () => {
    if (!hiringId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getClaimsByHiring(hiringId, token);
      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(err.message || 'Error al cargar los reclamos');
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, [hiringId, token]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  // Obtener reclamo activo (open o in_review)
  const activeClaim = claims.find(
    (claim) => claim.status === 'open' || claim.status === 'in_review'
  );

  // Verificar si tiene reclamo activo
  const hasActiveClaim = !!activeClaim;

  // Obtener el último reclamo
  const latestClaim = claims.length > 0 ? claims[0] : null;

  return {
    claims,
    loading,
    error,
    activeClaim,
    hasActiveClaim,
    latestClaim,
    refetch: fetchClaims,
  };
};

export default useClaims;
