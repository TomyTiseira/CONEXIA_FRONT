'use client';

import { useState, useEffect } from 'react';
import { fetchApplicationTypes } from '@/service/project/projectFetch';

export function useApplicationTypes() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApplicationTypes = async () => {
      try {
        setLoading(true);
        const applicationTypes = await fetchApplicationTypes();
        setData(applicationTypes);
        setError(null);
      } catch (err) {
        console.error('Error loading application types:', err);
        setError(err.message || 'Error al cargar los tipos de postulación');
      } finally {
        setLoading(false);
      }
    };

    loadApplicationTypes();
  }, []);

  return { data, loading, error };
}