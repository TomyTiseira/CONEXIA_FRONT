/**
 * Constantes y helpers para moderación de usuarios
 */

/**
 * Verifica si un usuario está restringido (baneado o suspendido)
 * @param {Object} userData - Datos del usuario (puede ser profile o profile.data)
 * @returns {boolean}
 */
export function isUserRestricted(userData) {
  if (!userData) return false;
  
  // Soporte para ambos formatos: userData directo o userData.profile
  const data = userData.profile || userData;
  
  return Boolean(data.isBanned || data.isSuspended);
}

/**
 * Verifica si un usuario está baneado permanentemente
 * @param {Object} userData - Datos del usuario
 * @returns {boolean}
 */
export function isUserBanned(userData) {
  if (!userData) return false;
  const data = userData.profile || userData;
  return Boolean(data.isBanned);
}

/**
 * Verifica si un usuario está suspendido temporalmente
 * @param {Object} userData - Datos del usuario
 * @returns {boolean}
 */
export function isUserSuspended(userData) {
  if (!userData) return false;
  const data = userData.profile || userData;
  return Boolean(data.isSuspended && !data.isBanned);
}

/**
 * Obtiene el mensaje apropiado según el estado del usuario
 * @param {Object} userData - Datos del usuario
 * @returns {string}
 */
export function getUserRestrictionMessage(userData) {
  if (!userData) return '';
  
  const data = userData.profile || userData;
  
  if (data.isBanned) {
    return 'Esta cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia.';
  }
  
  if (data.isSuspended && data.suspensionExpiresAt) {
    try {
      const expirationDate = new Date(data.suspensionExpiresAt);
      const formattedDate = expirationDate.toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return `Esta cuenta ha sido suspendida temporalmente hasta el ${formattedDate} por violación de las políticas de Conexia.`;
    } catch {
      return 'Esta cuenta ha sido suspendida temporalmente por violación de las políticas de Conexia.';
    }
  }
  
  if (data.isSuspended) {
    return 'Esta cuenta ha sido suspendida temporalmente por violación de las políticas de Conexia.';
  }
  
  return '';
}

/**
 * Verifica si la suspensión temporal ya expiró
 * @param {string | null} suspensionExpiresAt - Fecha de expiración en formato ISO
 * @returns {boolean}
 */
export function isSuspensionExpired(suspensionExpiresAt) {
  if (!suspensionExpiresAt) return false;
  try {
    return new Date() > new Date(suspensionExpiresAt);
  } catch {
    return false;
  }
}
