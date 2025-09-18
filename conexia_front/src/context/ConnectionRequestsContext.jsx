'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getConnectionRequests } from '@/service/connections/getConnectionRequests';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

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
  const { user } = useAuth();

  // Función para cargar las solicitudes
  const fetchRequests = async () => {
    // No cargar solicitudes si no hay usuario o si es admin o moderador
    if (!user || user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
      setRequests([]);
      setError(null);
      setLoading(false);
      return { requests: [] };
    }

    setLoading(true);
    try {
      const res = await getConnectionRequests();
      setRequests(res?.data || []);
      setError(null);
      return { requests: res?.data || [] };
    } catch (err) {
      console.error('Error al obtener solicitudes de conexión:', err);
      setError(err.message || 'Error al obtener solicitudes');
      setRequests([]);
      return { requests: [] };
    } finally {
      setLoading(false);
    }
  };

  // Cargar solicitudes al montar el componente, pero solo si el usuario puede tener conexiones
  useEffect(() => {
    // Solo ejecutar cuando user esté definido Y tenga la propiedad role cargada
    if (user !== null && user.role !== undefined) {
      fetchRequests();
    }
  }, [user]);

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
