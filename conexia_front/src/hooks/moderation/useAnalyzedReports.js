import { useState, useCallback } from 'react';
import { getAnalyzedReports } from '@/service/moderation';

/**
 * Hook para gestionar la carga de reportes analizados por la IA
 * @param {number} analysisId - ID del análisis
 */
export function useAnalyzedReports(analysisId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReports = useCallback(async () => {
    if (!analysisId) {
      setError('ID de análisis no proporcionado');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await getAnalyzedReports(analysisId);
      setData(response.data || response);
    } catch (err) {
      setError(err.message || 'Error al cargar reportes analizados');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  const retry = () => {
    loadReports();
  };

  return {
    data,
    loading,
    error,
    loadReports,
    retry,
  };
}
