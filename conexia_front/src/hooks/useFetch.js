'use client';
import { useEffect, useState, useCallback } from 'react';

export const useFetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    // No hacer llamadas si está en proceso de logout
    if (typeof window !== 'undefined' && window.__CONEXIA_LOGGING_OUT__ === true) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const results = await fetchFunction();
      setData(results);
    } catch (err) {
      // Silenciar errores durante el logout
      if (typeof window !== 'undefined' && window.__CONEXIA_LOGGING_OUT__ === true) {
        setIsLoading(false);
        return;
      }
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    // No hacer llamadas si está en proceso de logout
    if (typeof window !== 'undefined' && window.__CONEXIA_LOGGING_OUT__ === true) {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error,
    refetch: fetchData,
  };
};