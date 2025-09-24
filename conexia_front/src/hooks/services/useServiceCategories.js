import { useState, useEffect } from 'react';
import { fetchServiceCategories } from '@/service/services';

export function useServiceCategories() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const categories = await fetchServiceCategories();
        setData(Array.isArray(categories) ? categories : []);
      } catch (err) {
        setError(err.message);
        setData([]); // Asegurar que siempre sea un array
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return { data, loading, error };
}