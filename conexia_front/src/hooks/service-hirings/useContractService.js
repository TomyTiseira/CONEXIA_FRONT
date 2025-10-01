import { useState } from 'react';
import { contractService } from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook personalizado para contratar servicios
 */
export function useContractService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Contratar un servicio
   * @param {number} hiringId - ID de la contratación
   * @param {string} paymentMethod - Método de pago
   * @returns {Promise<Object>} Datos del pago y URL de MercadoPago
   */
  const contractHiring = async (hiringId, paymentMethod) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contractService(hiringId, paymentMethod);
      
      // Redirigir a MercadoPago si hay URL de pago (buscar en ambas propiedades)
      const paymentUrl = response.payment?.paymentUrl || response.payment?.mercadoPagoUrl;
      if (paymentUrl) {
        
        // Intentar abrir en nueva ventana
        const newWindow = window.open(paymentUrl, '_blank');
        
        // Si el popup fue bloqueado, usar location.href como fallback
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          window.location.href = paymentUrl;
        }
      } else {
        console.warn('No payment URL found in response');
      }
      
      return response;
    } catch (err) {
      console.error('Contract Service Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contractHiring,
    loading,
    error,
    setError
  };
}