import { useState } from 'react';
import { updateService } from '@/service/services';

export function useEditService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const editService = async (serviceId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateService(serviceId, data);
      return result;
    } catch (err) {
      setError(err.message || 'Error al editar el servicio');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editService, loading, error };
}