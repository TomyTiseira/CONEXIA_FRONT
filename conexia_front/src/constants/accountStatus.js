// constants/accountStatus.js

/**
 * Estados de cuenta de usuario
 */
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
};

/**
 * Tipos de acciones de moderación
 */
export const MODERATION_ACTION = {
  BAN_USER: 'ban_user',
  SUSPEND_USER: 'suspend_user',
  RELEASE_USER: 'release_user',
  KEEP_MONITORING: 'keep_monitoring'
};

/**
 * Nuevos estados de contratación de servicios
 */
export const SERVICE_HIRING_MODERATION_STATUS = {
  TERMINATED_BY_MODERATION: 'terminated_by_moderation',
  FINISHED_BY_MODERATION: 'finished_by_moderation'
};

/**
 * Nuevos estados de postulación
 */
export const POSTULATION_MODERATION_STATUS = {
  CANCELLED_BY_MODERATION: 'cancelled_by_moderation',
  CANCELLED_BY_SUSPENSION: 'cancelled_by_suspension'
};

/**
 * Mensajes de error para usuarios con restricciones
 */
export const ACCOUNT_STATUS_MESSAGES = {
  BANNED: {
    title: 'Cuenta Baneada',
    message: 'Tu cuenta ha sido baneada permanentemente. Si crees que esto es un error, contacta a soporte.',
    actionLabel: 'Contactar Soporte'
  },
  SUSPENDED: {
    title: 'Cuenta Suspendida',
    message: 'Tu cuenta está suspendida temporalmente. Puedes completar tus compromisos actuales pero no iniciar nuevos.',
    actionLabel: 'Ver Compromisos Actuales'
  }
};

/**
 * Calcula los días restantes hasta la reactivación
 */
export function calculateDaysRemaining(suspensionExpiresAt) {
  if (!suspensionExpiresAt) return 0;
  
  const now = new Date();
  const expiryDate = new Date(suspensionExpiresAt);
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formatea una fecha para mostrar al usuario
 */
export function formatReactivationDate(suspensionExpiresAt) {
  if (!suspensionExpiresAt) return '';
  
  const date = new Date(suspensionExpiresAt);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Valida si un usuario está baneado
 */
export function isUserBanned(user) {
  return user?.accountStatus === ACCOUNT_STATUS.BANNED;
}

/**
 * Valida si un usuario está suspendido
 */
export function isUserSuspended(user) {
  return user?.accountStatus === ACCOUNT_STATUS.SUSPENDED;
}

/**
 * Valida si un usuario tiene restricciones (baneado o suspendido)
 */
export function hasAccountRestrictions(user) {
  return isUserBanned(user) || isUserSuspended(user);
}

/**
 * Valida si una acción está bloqueada para el usuario
 */
export function isActionBlocked(user, actionType) {
  if (!user) return false;
  
  // Usuarios baneados tienen todas las acciones bloqueadas
  if (isUserBanned(user)) return true;
  
  // Usuarios suspendidos no pueden crear nuevo contenido
  if (isUserSuspended(user)) {
    const blockedActions = [
      'create_project',
      'create_service',
      'apply_to_project',
      'hire_service',
      'send_new_message'
    ];
    return blockedActions.includes(actionType);
  }
  
  return false;
}
