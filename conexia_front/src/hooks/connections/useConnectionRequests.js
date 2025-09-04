import { useEffect, useState } from 'react';
import { getConnectionRequests } from '@/service/connections/getConnectionRequests';

export function useConnectionRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getConnectionRequests()
      .then(res => {
        if (isMounted) {
          setRequests(res?.data || []);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Error al obtener solicitudes');
          setRequests([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  return { requests, loading, error, count: requests.length };
}
