import { useState, useEffect } from 'react';
import { fetchServiceDetail } from '@/service/services/servicesFetch';

/**
 * Hook para manejar el detalle de un servicio
 */
export function useServiceDetail(serviceId) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadServiceDetail = async (id = serviceId) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchServiceDetail(id);
      setService(response);
    } catch (err) {
      setError(err.message);
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalle inicialmente
  useEffect(() => {
    if (serviceId) {
      loadServiceDetail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  return {
    service,
    loading,
    error,
    loadServiceDetail,
    setService
  };
}