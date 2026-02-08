'use client';
import { useState, useEffect } from 'react';
import { findConnectionByUserId } from '@/service/connections/findConnectionByUserId';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

/**
 * Hook para buscar una conexión específica con un usuario
 * @param {string} userId - ID del usuario con el que se quiere verificar la conexión
 * @returns {Object} - Estado de la conexión, funciones para refrescar y estados de carga
 */
export function useFindConnection(userId) {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchConnection = async () => {
    if (!userId) {
      return;
    }
    
    // No buscar conexiones si no hay usuario o si es admin o moderador
    if (!user || user.role === ROLES.ADMIN || user.role === ROLES.MODERATOR) {
      setConnection(null);
      setError(null);
      setLoading(false);
      return null;
    }
    
    setLoading(true);
    try {
      const response = await findConnectionByUserId(userId);
      setConnection(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error('Error al buscar conexión:', err);
      setConnection(null);
      setError(err.message || 'Error al buscar conexión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar la conexión al montar el componente si hay userId
  useEffect(() => {
    // Solo ejecutar cuando user esté definido Y tenga la propiedad role cargada
    if (userId && user !== null && user.role !== undefined) {
      fetchConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user]); // Agregar user como dependencia

  return { 
    connection, 
    loading, 
    error, 
    refreshConnection: fetchConnection 
  };
}
