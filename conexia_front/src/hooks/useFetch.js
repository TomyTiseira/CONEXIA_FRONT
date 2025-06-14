'use client';
import { useEffect, useState, useCallback } from 'react';

export const useFetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await fetchFunction();
      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error,
    refetch: fetchData
  };
};