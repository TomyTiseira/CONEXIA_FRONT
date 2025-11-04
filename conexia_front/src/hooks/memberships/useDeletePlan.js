import { useState } from 'react';
import { deletePlan } from '@/service/memberships/membershipsFetch';

export const useDeletePlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (planId) => {
    try {
      setLoading(true);
      setError(null);
      await deletePlan(planId);
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar el plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error };
};
