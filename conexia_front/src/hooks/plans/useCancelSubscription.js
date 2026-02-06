import { useState } from 'react';
import { cancelSubscription } from '@/service/plans/plansService';

export function useCancelSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleCancelSubscription = async (reason = null) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await cancelSubscription(reason);
      
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err?.message || 'Error al cancelar la suscripción';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    handleCancelSubscription,
    loading,
    error,
    success,
    reset,
  };
}
