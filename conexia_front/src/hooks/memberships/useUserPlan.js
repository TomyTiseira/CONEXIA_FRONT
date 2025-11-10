'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserPlan } from '@/service/user/userFetch';

/**
 * Hook para obtener el plan activo del usuario autenticado
 * Incluye cache de 5 minutos para evitar llamadas repetitivas
 * 
 * @returns {Object} - Estado del plan del usuario
 * @property {Object|null} data - Información completa del plan y suscripción
 * @property {Object} data.plan - Información del plan
 * @property {number} data.plan.id - ID del plan
 * @property {string} data.plan.name - Nombre del plan
 * @property {string} data.plan.description - Descripción del plan
 * @property {number} data.plan.monthlyPrice - Precio mensual
 * @property {number} data.plan.annualPrice - Precio anual
 * @property {Array} data.plan.benefits - Beneficios del plan
 * @property {Object|null} data.subscription - Información de la suscripción (null si no tiene)
 * @property {number} data.subscription.id - ID de la suscripción
 * @property {string} data.subscription.status - Estado ('active', 'pending_payment', 'payment_failed', 'cancelled', 'expired', 'replaced')
 * @property {string} data.subscription.billingCycle - Ciclo de facturación ('monthly' | 'annual')
 * @property {Date|null} data.subscription.startDate - Fecha de inicio
 * @property {Date|null} data.subscription.endDate - Fecha de fin
 * @property {Date|null} data.subscription.nextPaymentDate - Fecha del próximo pago
 * @property {number} data.subscription.price - Precio del plan al contratar
 * @property {Object|null} data.paymentInfo - Información de pago (null si es plan free o no tiene)
 * @property {number} data.paymentInfo.nextPaymentAmount - Monto del próximo pago
 * @property {Date|null} data.paymentInfo.nextPaymentDate - Fecha del próximo pago
 * @property {Object|null} data.paymentInfo.paymentMethod - Método de pago
 * @property {string} data.paymentInfo.paymentMethod.type - Tipo de método de pago
 * @property {string} data.paymentInfo.paymentMethod.lastFourDigits - Últimos 4 dígitos
 * @property {string} data.paymentInfo.paymentMethod.brand - Marca de la tarjeta
 * @property {Date} data.memberSince - Fecha de alta del usuario
 * @property {boolean} data.isFreePlan - Indica si es plan gratuito
 * @property {boolean} isLoading - Estado de carga
 * @property {string|null} error - Mensaje de error si existe
 * @property {Function} refetch - Función para refrescar los datos
 * @property {boolean} isFreePlan - Indica si el usuario tiene plan gratuito
 * @property {Object|null} plan - Referencia rápida al plan
 * @property {Object|null} subscription - Referencia rápida a la suscripción
 * @property {Object|null} paymentInfo - Referencia rápida a la info de pago
 * @property {Date|null} memberSince - Referencia rápida a la fecha de alta
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
    paymentInfo: data?.paymentInfo ?? null,
    memberSince: data?.memberSince ?? null,
  };
}
