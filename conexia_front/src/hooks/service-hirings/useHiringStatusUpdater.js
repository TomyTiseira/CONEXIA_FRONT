import { useCallback } from 'react';

/**
 * Hook para manejar la actualización del estado de las solicitudes después de errores específicos
 */
export function useHiringStatusUpdater() {
  
  /**
   * Actualiza el estado de una solicitud a "rechazada" cuando el usuario solicitante fue dado de baja
   * @param {number} hiringId - ID de la solicitud
   * @param {function} updateHiringList - Función para actualizar la lista de solicitudes
   */
  const markAsRejectedDueToBannedUser = useCallback((hiringId, updateHiringList) => {
    if (updateHiringList && hiringId) {
      updateHiringList(prevHirings => 
        prevHirings.map(hiring => 
          hiring.id === hiringId 
            ? { 
                ...hiring, 
                status: { ...hiring.status, code: 'rejected' },
                rejectionReason: 'Usuario solicitante dado de baja',
                availableActions: [] // No hay acciones disponibles para solicitudes rechazadas automáticamente
              }
            : hiring
        )
      );
    }
  }, []);

  /**
   * Actualiza múltiples solicitudes que pueden haber sido afectadas por un usuario dado de baja
   * @param {number} bannedUserId - ID del usuario que fue dado de baja
   * @param {function} updateHiringList - Función para actualizar la lista de solicitudes
   */
  const markMultipleAsRejectedDueToBannedUser = useCallback((bannedUserId, updateHiringList) => {
    if (updateHiringList && bannedUserId) {
      updateHiringList(prevHirings => 
        prevHirings.map(hiring => 
          hiring.userId === bannedUserId && (hiring.status?.code === 'pending' || hiring.status?.code === 'quoted')
            ? { 
                ...hiring, 
                status: { ...hiring.status, code: 'rejected' },
                rejectionReason: 'Usuario solicitante dado de baja',
                availableActions: []
              }
            : hiring
        )
      );
    }
  }, []);

  return {
    markAsRejectedDueToBannedUser,
    markMultipleAsRejectedDueToBannedUser
  };
}