import { useState, useCallback } from 'react';
import {
  createDelivery,
  fetchDeliveries,
  reviewDelivery,
  fetchHiringWithDeliveries
} from '@/service/deliveries';

/**
 * Hook para gestionar las entregas de un servicio
 * @param {number} hiringId - ID de la contratación
 */
export function useDeliveries(hiringId) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDeliveries = useCallback(async () => {
    if (!hiringId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchDeliveries(hiringId);
      setDeliveries(data.deliveries || []);
      return data;
    } catch (err) {
      console.error('Error al cargar entregas:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hiringId]);

  return {
    deliveries,
    loading,
    error,
    loadDeliveries,
    setDeliveries
  };
}

/**
 * Hook para crear una nueva entrega
 */
export function useCreateDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDeliveryMutation = useCallback(async (hiringId, formData) => {
    setLoading(true);
    setError(null);

    try {
      const delivery = await createDelivery(hiringId, formData);
      return delivery;
    } catch (err) {
      console.error('Error al crear entrega:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createDelivery: createDeliveryMutation,
    loading,
    error,
    setError
  };
}

/**
 * Hook para revisar una entrega (aprobar o solicitar revisión)
 */
export function useReviewDelivery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reviewDeliveryMutation = useCallback(async (deliveryId, data) => {
    setLoading(true);
    setError(null);

    try {
      const delivery = await reviewDelivery(deliveryId, data);
      return delivery;
    } catch (err) {
      console.error('Error al revisar entrega:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reviewDelivery: reviewDeliveryMutation,
    loading,
    error,
    setError
  };
}

/**
 * Hook para obtener un hiring completo con entregas
 * @param {number} hiringId - ID de la contratación
 */
export function useHiringWithDeliveries(hiringId) {
  const [hiring, setHiring] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHiring = useCallback(async () => {
    if (!hiringId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchHiringWithDeliveries(hiringId);
      setHiring(data);
      return data;
    } catch (err) {
      console.error('Error al cargar contratación:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [hiringId]);

  return {
    hiring,
    loading,
    error,
    loadHiring,
    setHiring
  };
}
