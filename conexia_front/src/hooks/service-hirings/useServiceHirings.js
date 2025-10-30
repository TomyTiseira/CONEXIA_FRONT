import { useState, useCallback } from 'react';
import { 
  createServiceHiring,
  fetchMyServiceHirings,
  fetchMyServiceRequests,
  acceptQuotation,
  rejectQuotation,
  cancelServiceHiring,
  negotiateQuotation,
  contractService,
  requestRequote
} from '@/service/service-hirings/serviceHiringsFetch';

/**
 * Hook para manejar las contrataciones de servicios
 */
export function useServiceHirings() {
  const [hirings, setHirings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Crear solicitud de contratación
  const createHiring = async (serviceId, description) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createServiceHiring({ serviceId, description });
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener mis solicitudes de contratación
  const loadMyHirings = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchMyServiceHirings(filters);
      setHirings(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } catch (err) {
      setError(err.message);
      setHirings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener solicitudes de mis servicios
  const loadMyServiceRequests = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchMyServiceRequests(filters);
      setHirings(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } catch (err) {
      setError(err.message);
      setHirings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Aceptar cotización
  const acceptHiring = async (hiringId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await acceptQuotation(hiringId);
      // Actualizar el hiring en el estado local
      setHirings(prev => prev.map(h => 
        h.id === hiringId 
          ? { ...h, status: { ...h.status, code: 'accepted' }, availableActions: response.availableActions || [] }
          : h
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Rechazar cotización
  const rejectHiring = async (hiringId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await rejectQuotation(hiringId);
      // Actualizar el hiring en el estado local
      setHirings(prev => prev.map(h => 
        h.id === hiringId 
          ? { ...h, status: { ...h.status, code: 'rejected' }, availableActions: response.availableActions || [] }
          : h
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar solicitud
  const cancelHiring = async (hiringId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cancelServiceHiring(hiringId);
      // Actualizar el hiring en el estado local
      setHirings(prev => prev.map(hiring => 
        hiring.id === hiringId 
          ? { ...hiring, status: { ...hiring.status, code: 'cancelled' }, availableActions: response.availableActions || [] }
          : hiring
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Negociar cotización
  const negotiateHiring = async (hiringId, negotiationData = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await negotiateQuotation(hiringId, negotiationData);
      // Actualizar el hiring en el estado local
      setHirings(prev => prev.map(hiring => 
        hiring.id === hiringId 
          ? { ...hiring, status: { ...hiring.status, code: 'negotiating' }, availableActions: response.availableActions || [] }
          : hiring
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Contratar servicio
  const contractHiring = async (hiringId, paymentMethod) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await contractService(hiringId, paymentMethod);
      // Actualizar el hiring en el estado local
      setHirings(prev => prev.map(h => 
        h.id === hiringId 
          ? { ...h, status: { ...h.status, code: 'approved' }, availableActions: response.availableActions || [] }
          : h
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Solicitar re-cotización
  const requoteHiring = async (hiringId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestRequote(hiringId);
      // Actualizar el hiring en el estado local - vuelve a estado 'pending'
      setHirings(prev => prev.map(h => 
        h.id === hiringId 
          ? { ...h, status: { ...h.status, code: 'pending' }, availableActions: response.availableActions || [], isExpired: false }
          : h
      ));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    hirings,
    pagination,
    loading,
    error,
    createHiring,
    loadMyHirings,
    loadMyServiceRequests,
    acceptHiring,
    rejectHiring,
    cancelHiring,
    negotiateHiring,
    contractHiring,
    requoteHiring,
    setHirings,
    setError
  };
}