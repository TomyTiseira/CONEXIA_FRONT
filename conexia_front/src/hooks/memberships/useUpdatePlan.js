import { useState } from 'react';
import { updatePlan } from '@/service/memberships/membershipsFetch';

export const useUpdatePlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (planId, planData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updatePlan(planId, planData);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar el plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
};
