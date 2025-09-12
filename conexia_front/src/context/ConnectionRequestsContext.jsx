'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getConnectionRequests } from '@/service/connections/getConnectionRequests';

// Crear el contexto
const ConnectionRequestsContext = createContext({
  requests: [],
  count: 0,
  loading: false,
  error: null,
  refreshRequests: () => {},
});

// Proveedor del contexto
export function ConnectionRequestsProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar las solicitudes
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getConnectionRequests();
      setRequests(res?.data || []);
      setError(null);
      return { requests: res?.data || [] };
    } catch (err) {
      setError(err.message || 'Error al obtener solicitudes');
      setRequests([]);
      return { requests: [] };
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes al montar el componente
  useEffect(() => {
    fetchRequests();
  }, []);

  // Valor del contexto
  const value = {
    requests,
    count: requests.length,
    loading,
    error,
    refreshRequests: fetchRequests,
  };

  return (
    <ConnectionRequestsContext.Provider value={value}>
      {children}
    </ConnectionRequestsContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useConnectionRequestsContext() {
  const context = useContext(ConnectionRequestsContext);
  if (context === undefined) {
    throw new Error('useConnectionRequestsContext debe usarse dentro de un ConnectionRequestsProvider');
  }
  return context;
}
