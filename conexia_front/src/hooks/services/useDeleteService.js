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
      // Mantener la información del error para manejo específico
      const errorInfo = {
        message: err.message || 'Error al eliminar el servicio',
        statusCode: err.statusCode,
        status: err.status
      };
      setError(errorInfo);
      
      // Propagar el error con la información adicional
      const enhancedError = new Error(errorInfo.message);
      enhancedError.statusCode = errorInfo.statusCode;
      enhancedError.status = errorInfo.status;
      throw enhancedError;
    } finally {
      setLoading(false);
    }
  };

  return { removeService, loading, error };
}