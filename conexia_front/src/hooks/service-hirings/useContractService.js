import { useState } from 'react';
import { contractService } from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook personalizado para contratar servicios con MercadoPago Checkout Pro
 */
export function useContractService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Contratar un servicio
   * @param {number} hiringId - ID de la contratación
   * @param {string} paymentMethod - Método de pago: 'credit_card' | 'debit_card' | 'bank_transfer'
   * @returns {Promise<Object>} Datos del pago y URL de MercadoPago
   */
  const contractHiring = async (hiringId, paymentMethod) => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamar al backend para crear la preferencia de pago
      const response = await contractService(hiringId, paymentMethod);
      
      // El backend debe devolver { success: true, data: { mercadoPagoUrl, paymentId, preferenceId } }
      if (response.success && response.data?.mercadoPagoUrl) {
        // Redirección INMEDIATA a MercadoPago (Checkout Pro)
        window.location.href = response.data.mercadoPagoUrl;
      } else {
        console.error('❌ [FRONTEND] No se recibió URL de pago válida:', response);
        throw new Error(response.message || 'No se pudo obtener la URL de pago');
      }
      
      return response;
    } catch (err) {
      console.error('❌ [FRONTEND] Error en contratación:', err.message || err);
      
      const errorMessage = err.message || 'Error al procesar la contratación';
      setError(errorMessage);
      throw err; // Lanzar el error original completo
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