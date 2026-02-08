import { useMemo } from 'react';

/**
 * Hook para verificar el estado del owner de un servicio/proyecto
 * @param {object} data - Objeto que contiene ownerAccountStatus, ownerIsSuspended, ownerModerationStatus, etc.
 * @returns {object} Estado del owner y helpers
 */
export function useOwnerStatus(data) {
  const isOwnerSuspended = useMemo(() => {
    // Usar el nuevo campo owner_moderation_status como fuente principal
    if (data?.ownerModerationStatus === 'suspended') return true;
    // Fallback al campo antiguo por compatibilidad
    return data?.ownerIsSuspended === true;
  }, [data?.ownerIsSuspended, data?.ownerModerationStatus]);

  const isOwnerBanned = useMemo(() => {
    // Usar el nuevo campo owner_moderation_status como fuente principal
    if (data?.ownerModerationStatus === 'banned') return true;
    // Fallback al campo antiguo por compatibilidad
    return data?.ownerIsBanned === true;
  }, [data?.ownerIsBanned, data?.ownerModerationStatus]);

  const canInteract = useMemo(() => {
    return !isOwnerSuspended && !isOwnerBanned;
  }, [isOwnerSuspended, isOwnerBanned]);

  const ownerStatusMessage = useMemo(() => {
    if (isOwnerBanned) {
      return 'El propietario de este contenido tiene su cuenta suspendida permanentemente';
    }
    
    if (isOwnerSuspended) {
      if (data?.ownerSuspensionExpiresAt) {
        const date = new Date(data.ownerSuspensionExpiresAt).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return `El propietario tiene su cuenta suspendida hasta el ${date}. No puedes interactuar con este contenido por el momento.`;
      }
      return 'El propietario tiene su cuenta suspendida temporalmente';
    }
    
    return null;
  }, [isOwnerBanned, isOwnerSuspended, data?.ownerSuspensionExpiresAt]);

  return {
    isOwnerSuspended,
    isOwnerBanned,
    canInteract,
    ownerStatusMessage,
    ownerAccountStatus: data?.ownerAccountStatus || 'active',
  };
}
