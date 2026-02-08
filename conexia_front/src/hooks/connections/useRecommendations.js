import { useState, useEffect } from 'react';
import { getRecommendations } from '@/service/connections/getRecommendations';

/**
 * Hook para gestionar las recomendaciones de conexiones
 * @param {boolean} enabled - Si se debe ejecutar la consulta automáticamente
 * @returns {Object} Estado y funciones para gestionar recomendaciones
 */
export function useRecommendations(enabled = true) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecommendations();
      // El backend devuelve las recomendaciones ya ordenadas por match de habilidades y amigos en común
      setRecommendations(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar recomendaciones');
      console.error('Error al cargar recomendaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchRecommendations();
    }
  }, [enabled]);

  return {
    recommendations,
    loading,
    error,
    refetch: fetchRecommendations,
  };
}