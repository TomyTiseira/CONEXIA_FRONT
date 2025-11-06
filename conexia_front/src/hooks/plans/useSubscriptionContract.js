import { useState } from 'react';
import { contractPlan } from '@/service/plans/plansService';

/**
 * Hook para manejar la contratación de planes
 * @returns {Object} Estado y funciones para contratar un plan
 */
export function useSubscriptionContract() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractData, setContractData] = useState(null);

  /**
   * Iniciar el proceso de contratación
   * @param {number} planId - ID del plan a contratar
   * @param {'monthly'|'annual'} billingCycle - Ciclo de facturación
   * @param {string} cardTokenId - Token de tarjeta de MercadoPago
   */
  const handleContractPlan = async (planId, billingCycle, cardTokenId) => {
    setLoading(true);
    setError(null);
    setContractData(null);

    try {
      const response = await contractPlan(planId, billingCycle, cardTokenId);
      
      // Guardar datos de la suscripción en localStorage para tracking
      const subscriptionData = {
        planId,
        billingCycle,
        subscriptionId: response.data?.subscriptionId,
        mercadoPagoSubscriptionId: response.data?.mercadoPagoSubscriptionId,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData));
      
      setContractData(response);
      
      // Redirigir a MercadoPago para autorizar débito automático
      if (response.data?.mercadoPagoUrl) {
        window.location.href = response.data.mercadoPagoUrl;
      }
      
      return response;
    } catch (err) {
      setError(err.message || 'Error al contratar el plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar el estado del hook
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setContractData(null);
  };

  return {
    loading,
    error,
    contractData,
    handleContractPlan,
    reset,
  };
}
