import { useState, useEffect } from 'react';
import { getBenefits } from '@/service/memberships/membershipsFetch';

export const useBenefits = () => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBenefits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBenefits();
      setBenefits(response.data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los beneficios');
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  return { benefits, loading, error, refetch: loadBenefits };
};
