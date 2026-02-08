/**
 * useClaimPermissions Hook
 * Determina si un usuario puede crear o gestionar reclamos
 */

import { useMemo } from 'react';
import { ALLOWED_CLAIM_STATES } from '@/constants/claims';
import { ROLES } from '@/constants/roles';
import { useRole } from '@/hooks/useRole';

/**
 * Hook para determinar permisos de reclamos
 * @param {Object} user - Usuario actual
 * @param {Object} hiring - Contratación
 * @param {Array} claims - Reclamos existentes
 * @returns {Object} - Permisos y razones
 */
export const useClaimPermissions = (user, hiring, claims = []) => {
  // Obtener el rol del usuario usando useRole
  const { role: userRole, loading: roleLoading } = useRole(user?.roleId);
  
  const permissions = useMemo(() => {
    if (!user || !hiring) {
      return {
        canCreate: false,
        canView: false,
        canResolve: false,
        reason: 'Datos incompletos',
      };
    }

    // Si aún está cargando el rol, retornar permisos vacíos temporalmente
    if (roleLoading) {
      return {
        canCreate: false,
        canView: false,
        canResolve: false,
        reason: 'Cargando...',
      };
    }

    const isAdmin = userRole === ROLES.ADMIN;
    const isModerator = userRole === ROLES.MODERATOR;
    
    // Determinar si es cliente o proveedor
    // Si hiring tiene requestedBy, el usuario actual podría ser el cliente que lo solicitó
    // Si hiring tiene service.owner, el usuario actual podría ser el proveedor
    const isClient = !!(hiring.requestedBy?.id === user.id || hiring.clientId === user.id || hiring.client?.id === user.id || hiring.userId === user.id);
    const isProvider = !!(hiring.service?.owner?.id === user.id || hiring.service?.ownerId === user.id || hiring.service?.userId === user.id || hiring.providerId === user.id);
    const isPartOfHiring = isClient || isProvider;

    // Verificar si hay un reclamo activo (open o in_review)
    const activeClaim = claims.find(
      (claim) => claim.status === 'open' || claim.status === 'in_review'
    );

    // CREAR RECLAMO
    // Solo cliente o proveedor pueden crear
    // No admin/moderador
    // No si ya existe reclamo activo
    // Solo en estados permitidos
    const canCreate = (() => {
      if (isAdmin || isModerator) {
        return {
          allowed: false,
          reason: 'Administradores y moderadores no pueden crear reclamos',
        };
      }

      if (!isPartOfHiring) {
        return {
          allowed: false,
          reason: 'No eres parte de esta contratación',
        };
      }

      if (activeClaim) {
        return {
          allowed: false,
          reason: 'Ya existe un reclamo activo para este servicio',
        };
      }

      const hiringStatus = hiring.status?.code || hiring.status;
      if (!ALLOWED_CLAIM_STATES.includes(hiringStatus)) {
        return {
          allowed: false,
          reason: `Estado "${hiringStatus}" no permite crear reclamos`,
        };
      }

      return { allowed: true, reason: null };
    })();

    // VER RECLAMO
    // Cliente, proveedor, admin o moderador pueden ver
    const canView = isPartOfHiring || isAdmin || isModerator;

    // RESOLVER/MARCAR EN REVISIÓN
    // Solo admin o moderador
    const canResolve = isAdmin || isModerator;

    return {
      canCreate: canCreate.allowed,
      canCreateReason: canCreate.reason,
      canView,
      canResolve,
      isAdmin,
      isModerator,
      isClient,
      isProvider,
      isPartOfHiring,
      activeClaim,
      hasActiveClaim: !!activeClaim,
    };
  }, [user, hiring, claims, userRole, roleLoading]);

  return permissions;
};

/**
 * Hook simplificado solo para verificar si se puede crear
 * @param {Object} user - Usuario actual
 * @param {string} hiringStatus - Estado de la contratación
 * @param {boolean} hasActiveClaim - Si existe reclamo activo
 * @returns {Object} - { canCreate, reason }
 */
export const useCanCreateClaim = (user, hiringStatus, hasActiveClaim) => {
  return useMemo(() => {
    if (!user) {
      return { canCreate: false, reason: 'Usuario no autenticado' };
    }

    const isAdmin = user.role === ROLES.ADMIN;
    const isModerator = user.role === ROLES.MODERATOR;

    if (isAdmin || isModerator) {
      return {
        canCreate: false,
        reason: 'Administradores y moderadores no pueden crear reclamos',
      };
    }

    if (hasActiveClaim) {
      return {
        canCreate: false,
        reason: 'Ya existe un reclamo activo',
      };
    }

    if (!ALLOWED_CLAIM_STATES.includes(hiringStatus)) {
      return {
        canCreate: false,
        reason: `Estado "${hiringStatus}" no permite crear reclamos`,
      };
    }

    return { canCreate: true, reason: null };
  }, [user, hiringStatus, hasActiveClaim]);
};

export default useClaimPermissions;
