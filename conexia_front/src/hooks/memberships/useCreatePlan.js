import { useState } from 'react';
import { createPlan } from '@/service/memberships/membershipsFetch';

export const useCreatePlan = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (planData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await createPlan(planData);
      return response.data;
    } catch (err) {
      const errorMessage = err.message || 'Error al crear el plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
