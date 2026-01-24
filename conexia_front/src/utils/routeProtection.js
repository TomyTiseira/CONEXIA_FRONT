/**
 * Utilidad para interceptar rutas protegidas y redirigir usuarios suspendidos
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccountStatus } from '@/hooks/useAccountStatus';

/**
 * Hook para proteger rutas de creación de contenido
 * Redirige al usuario a la página principal si está suspendido
 * @param {string} redirectTo - Ruta a la que redirigir (por defecto la página anterior)
 * @returns {boolean} - true si puede acceder, false si será redirigido
 */
export function useProtectCreateRoutes(redirectTo = null) {
  const router = useRouter();
  const { canCreateContent, isSuspended, isBanned, suspensionMessage } = useAccountStatus();

  useEffect(() => {
    if (!canCreateContent && (isSuspended || isBanned)) {
      // Guardar mensaje en sessionStorage para mostrar después
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectReason', JSON.stringify({
          type: isBanned ? 'error' : 'warning',
          message: suspensionMessage || 'No puedes crear contenido en este momento.',
          timestamp: Date.now()
        }));
      }

      // Redirigir
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.back();
      }
    }
  }, [canCreateContent, isSuspended, isBanned, suspensionMessage, router, redirectTo]);

  return canCreateContent;
}

/**
 * Componente HOC para proteger páginas de creación
 * @param {React.Component} Component - Componente a proteger
 * @param {string} redirectTo - Ruta de redirección
 * @returns {React.Component} - Componente protegido
 */
export function withCreateProtection(Component, redirectTo = null) {
  return function ProtectedComponent(props) {
    const canAccess = useProtectCreateRoutes(redirectTo);

    if (!canAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
