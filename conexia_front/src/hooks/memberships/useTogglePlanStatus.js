import { useState } from 'react';
import { togglePlanStatus } from '@/service/memberships/membershipsFetch';

export const useTogglePlanStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggle = async (planId, active) => {
    try {
      setLoading(true);
      setError(null);
      const response = await togglePlanStatus(planId, active);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Error al cambiar el estado del plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { toggle, loading, error };
};
