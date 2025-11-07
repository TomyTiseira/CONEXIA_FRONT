'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserPlan } from '@/service/user/userFetch';

/**
 * Hook para obtener el plan activo del usuario autenticado
 * Incluye cache de 5 minutos para evitar llamadas repetitivas
 * 
 * @returns {Object} - Estado del plan del usuario
 * @property {Object|null} data - Información del plan y suscripción
 * @property {boolean} isLoading - Estado de carga
 * @property {string|null} error - Mensaje de error si existe
 * @property {Function} refetch - Función para refrescar los datos
 * @property {boolean} isFreePlan - Indica si el usuario tiene plan gratuito
 */
export function useUserPlan() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);

  const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

  const fetchUserPlan = useCallback(async (forceRefresh = false) => {
    // Si no ha pasado el tiempo de cache y no es force refresh, no hacer fetch
    const now = Date.now();
    if (!forceRefresh && data && (now - lastFetch < CACHE_TIME)) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const planData = await getUserPlan();
      setData(planData);
      setLastFetch(now);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar el plan del usuario';
      setError(errorMessage);
      console.error('Error fetching user plan:', err);
      
      // Fallback: Si falla, asumir plan Free
      setData({
        plan: {
          id: 1,
          name: 'Free',
          description: 'Plan básico gratuito',
          monthlyPrice: 0,
          annualPrice: 0,
          benefits: []
        },
        isFreePlan: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [data, lastFetch, CACHE_TIME]);

  useEffect(() => {
    fetchUserPlan();
  }, [fetchUserPlan]);

  const refetch = useCallback(() => {
    fetchUserPlan(true);
  }, [fetchUserPlan]);

  return {
    data,
    isLoading,
    error,
    refetch,
    isFreePlan: data?.isFreePlan ?? true,
    plan: data?.plan ?? null,
    subscription: data?.subscription ?? null,
  };
}
