import { useState } from 'react';
import { 
  createQuotation, 
  updateQuotation,
  createQuotationWithDeliverables,
  updateQuotationWithDeliverables
} from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook para manejar cotizaciones
 */
export function useQuotations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear cotización (endpoint antiguo - compatibilidad)
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

  // Editar cotización (endpoint antiguo - compatibilidad)
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

  // Crear cotización con modalidad de pago (nuevo endpoint)
  const createQuoteWithModality = async (hiringId, quotationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createQuotationWithDeliverables(hiringId, quotationData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Editar cotización con modalidad de pago (nuevo endpoint)
  const updateQuoteWithModality = async (hiringId, quotationData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateQuotationWithDeliverables(hiringId, quotationData);
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
    createQuoteWithModality,
    updateQuoteWithModality,
    setError
  };
}