import { useState, useEffect, useCallback } from 'react';
import { getPlans, getPlanById } from '@/service/plans';

/**
 * Hook para manejar la obtención y estado de los planes
 * @param {boolean} includeInactive - Si se deben incluir planes inactivos
 * @returns {Object} - Estado y funciones para manejar planes
 */
export function usePlans(includeInactive = false) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getPlans(includeInactive);
      setPlans(response.data || []);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar los planes';
      setError(errorMessage);
      console.error('Error fetching plans:', err);
      
      // Si es error de autenticación, podría manejarse aquí
      if (err.statusCode === 401) {
        // El fetchWithRefresh ya maneja la renovación de token
        // Si falla, redirigirá automáticamente
      }
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
}

/**
 * Hook para obtener un plan específico por ID
 * @param {number} planId - ID del plan a obtener
 * @returns {Object} - Estado del plan específico
 */
export function usePlan(planId) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlan = useCallback(async () => {
    if (!planId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getPlanById(planId);
      setPlan(response.data);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar el plan';
      setError(errorMessage);
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return {
    plan,
    loading,
    error,
    refetch: fetchPlan,
  };
}
