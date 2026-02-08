import { useState, useEffect, useCallback } from 'react';
import { fetchUserServices } from '@/service/services/servicesFetch';

/**
 * Hook para manejar los servicios de un usuario específico
 */
export function useUserServices(userId) {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserServices = useCallback(async (filters = {}) => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchUserServices(userId, filters);
      setServices(response.services || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (err) {
      setError(err.message);
      setServices([]);
      setPagination({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Cargar servicios inicialmente
  useEffect(() => {
    if (userId) {
      loadUserServices();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    services,
    pagination,
    loading,
    error,
    loadUserServices,
    setServices,
    setPagination
  };
}