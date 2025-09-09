'use client';
import { useState, useEffect } from 'react';
import { findConnectionByUserId } from '@/service/connections/findConnectionByUserId';

/**
 * Hook para buscar una conexión específica con un usuario
 * @param {string} userId - ID del usuario con el que se quiere verificar la conexión
 * @returns {Object} - Estado de la conexión, funciones para refrescar y estados de carga
 */
export function useFindConnection(userId) {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConnection = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await findConnectionByUserId(userId);
      setConnection(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setConnection(null);
      setError(err.message || 'Error al buscar conexión');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cargar la conexión al montar el componente si hay userId
  useEffect(() => {
    if (userId) {
      fetchConnection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return { 
    connection, 
    loading, 
    error, 
    refreshConnection: fetchConnection 
  };
}
