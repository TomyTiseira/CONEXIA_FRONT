import { useState } from 'react';
import { deleteService } from '@/service/services';

export function useDeleteService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const removeService = async (serviceId, reason) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await deleteService(serviceId, reason);
      return result;
    } catch (err) {
      setError(err.message || 'Error al eliminar el servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { removeService, loading, error };
}