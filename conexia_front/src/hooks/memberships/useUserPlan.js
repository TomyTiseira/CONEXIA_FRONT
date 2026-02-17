'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserPlan } from '@/service/user/userFetch';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';

/**
 * Hook para obtener el plan activo del usuario autenticado
 * Incluye cache de 5 minutos para evitar llamadas repetitivas
 * Solo funciona para usuarios con rol USER (admin/moderador no tienen planes)
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
  const { roleName } = useUserStore();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(0);
  const [hasFetched, setHasFetched] = useState(false);

  const CACHE_TIME = 5 * 60 * 1000; // 5 minutos
  
  // Admin y Moderador no tienen planes, solo usuarios normales
  const isRegularUser = roleName === ROLES.USER;

  const fetchUserPlan = useCallback(async (forceRefresh = false) => {
    // Si no es usuario regular, no hacer nada
    if (!isRegularUser) {
      setIsLoading(false);
      setHasFetched(true);
      return;
    }
    
    // Si no ha pasado el tiempo de cache y no es force refresh, no hacer fetch
    const now = Date.now();
    if (!forceRefresh && hasFetched && (now - lastFetch < CACHE_TIME)) {
      return;
    }

    // Si ya falló una vez y no es force refresh, no reintentar
    if (!forceRefresh && error && hasFetched) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const planData = await getUserPlan();
      setData(planData);
      setLastFetch(now);
      setHasFetched(true);
    } catch (err) {
      const errorMessage = err.message || 'Error al cargar el plan del usuario';
      setError(errorMessage);
      
      // Solo mostrar el error en consola si no es un error silencioso (esperado)
      if (!err.silent) {
        console.error('Error fetching user plan:', err);
      }
      
      // Si falla, no establecer datos fallback para que el componente pueda decidir no mostrarse
      setData(null);
      setHasFetched(true);
    } finally {
      setIsLoading(false);
    }
  }, [isRegularUser, hasFetched, lastFetch, error, CACHE_TIME]);

  useEffect(() => {
    // Solo ejecutar una vez al montar o cuando hasFetched cambia
    if (!hasFetched) {
      fetchUserPlan();
    }
  }, [hasFetched, fetchUserPlan]);

  const refetch = useCallback(() => {
    setHasFetched(false);
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
