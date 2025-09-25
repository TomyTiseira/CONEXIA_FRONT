import { useState } from 'react';
import { 
  createQuotation, 
  updateQuotation 
} from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook para manejar cotizaciones
 */
export function useQuotations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear cotización
  const createQuote = async (hiringId, quotationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createQuotation(hiringId, quotationData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Editar cotización
  const updateQuote = async (hiringId, quotationId, quotationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateQuotation(hiringId, quotationId, quotationData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createQuote,
    updateQuote,
    setError
  };
}