import { useState, useEffect, useCallback } from 'react';
import { getPlans } from '@/service/memberships/membershipsFetch';

export const usePlans = (includeInactive = false) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPlans(includeInactive);
      setPlans(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los planes');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [includeInactive]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  return { plans, loading, error, refetch: loadPlans };
};
