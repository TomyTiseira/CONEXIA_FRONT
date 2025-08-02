// hooks/common/useLocalities.js
'use client';
import { useState, useEffect } from 'react';
import { getLocalities } from '@/service/localities/localitiesFetch';

export function useLocalities() {
  const [localities, setLocalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getLocalities()
      .then(data => {
        if (isMounted) setLocalities(data);
      })
      .catch(err => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return { localities, loading, error };
}
