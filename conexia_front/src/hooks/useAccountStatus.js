import { useUserStore } from '@/store/userStore';
import { useMemo } from 'react';

/**
 * Hook para verificar el estado de la cuenta del usuario
 * @returns {object} Estado de cuenta y helpers
 */
export function useAccountStatus() {
  const { accountStatus, isSuspended, isBanned, suspensionExpiresAt, suspensionReason } = useUserStore();

  const canCreateContent = useMemo(() => {
    return accountStatus === 'active';
  }, [accountStatus]);

  const suspensionMessage = useMemo(() => {
    if (isBanned) {
      return 'Tu cuenta ha sido suspendida permanentemente';
    }
    
    if (isSuspended) {
      if (suspensionExpiresAt) {
        const date = new Date(suspensionExpiresAt).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        return `Tu cuenta está suspendida hasta el ${date}`;
      }
      return 'Tu cuenta está suspendida temporalmente';
    }
    
    return null;
  }, [isBanned, isSuspended, suspensionExpiresAt]);

  const shortSuspensionMessage = useMemo(() => {
    if (isBanned) {
      return 'Cuenta suspendida permanentemente';
    }
    
    if (isSuspended) {
      if (suspensionExpiresAt) {
        const date = new Date(suspensionExpiresAt).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        return `Cuenta suspendida hasta el ${date}`;
      }
      return 'Cuenta suspendida temporalmente';
    }
    
    return null;
  }, [isBanned, isSuspended, suspensionExpiresAt]);

  const bannerType = useMemo(() => {
    if (isBanned) return 'error'; // Rojo
    if (isSuspended) return 'warning'; // Amarillo
    return null;
  }, [isBanned, isSuspended]);

  const detailedMessage = useMemo(() => {
    if (isBanned) {
      return 'Tu cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia. Contacta a soporte para más información.';
    }
    
    if (isSuspended) {
      let message = suspensionMessage;
      if (suspensionReason) {
        message += `. Motivo: ${suspensionReason}`;
      }
      message += '. Durante este período no puedes crear nuevos servicios, proyectos ni postulaciones, pero puedes completar tus compromisos actuales.';
      return message;
    }
    
    return null;
  }, [isBanned, isSuspended, suspensionMessage, suspensionReason]);

  return {
    accountStatus,
    isSuspended,
    isBanned,
    canCreateContent,
    suspensionMessage,
    shortSuspensionMessage,
    detailedMessage,
    bannerType,
    suspensionExpiresAt,
  };
}
