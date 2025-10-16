import { useState, useEffect } from 'react';
import { fetchPaymentModalities } from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook para manejar modalidades de pago
 */
export function usePaymentModalities() {
  const [modalities, setModalities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar modalidades al montar el componente
  const loadModalities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchPaymentModalities();
      setModalities(data);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar modalidades de pago:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener modalidad por ID
  const getModalityById = (id) => {
    return modalities.find(m => m.id === id);
  };

  // Obtener modalidad por código
  const getModalityByCode = (code) => {
    return modalities.find(m => m.code === code);
  };

  // Verificar si una modalidad es "pago total"
  const isFullPayment = (modalityId) => {
    const modality = getModalityById(modalityId);
    return modality?.code === 'full_payment';
  };

  // Verificar si una modalidad es "por entregables"
  const isByDeliverables = (modalityId) => {
    const modality = getModalityById(modalityId);
    return modality?.code === 'by_deliverables';
  };

  return {
    modalities,
    loading,
    error,
    loadModalities,
    getModalityById,
    getModalityByCode,
    isFullPayment,
    isByDeliverables
  };
}
