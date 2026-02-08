'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  isUserBanned, 
  isUserSuspended, 
  isActionBlocked 
} from '@/constants/accountStatus';

/**
 * Hook personalizado para manejar restricciones de cuenta
 * 
 * @returns {Object} Estado de restricciones y funciones de validación
 */
export function useAccountRestrictions() {
  const { user } = useAuth();

  const restrictions = useMemo(() => {
    if (!user) {
      return {
        isBanned: false,
        isSuspended: false,
        hasRestrictions: false,
        canCreateProject: false,
        canCreateService: false,
        canApplyToProject: false,
        canHireService: false,
        canSendMessage: true,
        accountStatus: null
      };
    }

    const banned = isUserBanned(user);
    const suspended = isUserSuspended(user);
    const hasRestrictions = banned || suspended;

    return {
      isBanned: banned,
      isSuspended: suspended,
      hasRestrictions,
      canCreateProject: !isActionBlocked(user, 'create_project'),
      canCreateService: !isActionBlocked(user, 'create_service'),
      canApplyToProject: !isActionBlocked(user, 'apply_to_project'),
      canHireService: !isActionBlocked(user, 'hire_service'),
      canSendMessage: !isActionBlocked(user, 'send_new_message'),
      accountStatus: user.accountStatus,
      suspensionExpiresAt: user.suspensionExpiresAt,
      suspensionReason: user.suspensionReason,
      banReason: user.banReason
    };
  }, [user]);

  /**
   * Verifica si una acción específica está permitida
   * @param {string} actionType - Tipo de acción a verificar
   * @returns {boolean} true si está permitida, false si está bloqueada
   */
  const canPerformAction = (actionType) => {
    if (!user) return false;
    return !isActionBlocked(user, actionType);
  };

  /**
   * Obtiene el mensaje de error apropiado según el tipo de restricción
   * @param {string} actionType - Tipo de acción que se intentó realizar
   * @returns {string} Mensaje de error personalizado
   */
  const getRestrictionMessage = (actionType) => {
    if (!user) return '';

    if (restrictions.isBanned) {
      return 'Tu cuenta ha sido baneada permanentemente. No puedes realizar esta acción.';
    }

    if (restrictions.isSuspended) {
      const date = restrictions.suspensionExpiresAt 
        ? new Date(restrictions.suspensionExpiresAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : '';
      
      return `Tu cuenta está suspendida hasta el ${date}. Puedes completar tus compromisos actuales pero no iniciar nuevos.`;
    }

    return '';
  };

  return {
    ...restrictions,
    canPerformAction,
    getRestrictionMessage
  };
}
