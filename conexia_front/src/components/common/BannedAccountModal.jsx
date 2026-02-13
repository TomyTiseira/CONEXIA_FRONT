'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isUserBanned } from '@/constants/accountStatus';
import { logoutUser } from '@/service/auth/authService';

/**
 * Modal bloqueador para usuarios baneados (estilo Conexia).
 * Se muestra cuando el usuario recarga la página estando baneado.
 * 
 * Requiere que el usuario haga clic en "Cerrar Sesión" manualmente.
 */
export default function BannedAccountModal() {
  const { user, logout } = useAuth();

  // Solo mostrar si el usuario está baneado Y NO hay logout en progreso
  const isLogoutInProgress = typeof window !== 'undefined' && sessionStorage.getItem('logout-in-progress') === 'true';
  const isBanned = user && isUserBanned(user) && !isLogoutInProgress;

  useEffect(() => {
    // Prevenir scroll cuando el modal está activo
    if (isBanned) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBanned]);

  const handleLogout = async (e) => {
    // Prevenir cualquier comportamiento default
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Flag global para prevenir interferencias
    if (typeof window !== 'undefined') {
      window.__CONEXIA_FORCE_LOGOUT__ = true;
      window.__CONEXIA_LOGGING_OUT__ = true;
    }
    
    sessionStorage.setItem('logout-in-progress', 'true');
    
    // 1. Llamar al backend para DESTRUIR las cookies HttpOnly
    try {
      await logoutUser();
    } catch (error) {
      // Continuar de todas formas con la limpieza local
    }
    
    // 2. Limpiar TODO localStorage y sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Restaurar flag después de clear
      sessionStorage.setItem('logout-in-progress', 'true');
    } catch (e) {
    }

    // 3. Logout del contexto (limpiar state de React)
    try {
      logout();
    } catch (e) {
    }

    // 4. Redirigir INMEDIATAMENTE al home
    window.location.replace('/');
  };

  if (!isBanned) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header con gradiente rojo */}
        <div className="p-8 bg-gradient-to-r from-red-500 to-red-600">
          <h3 className="text-white text-2xl font-bold text-center">Cuenta suspendida permanentemente</h3>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          {/* Alert banner principal */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-red-800 text-sm leading-relaxed">
                  Tu cuenta ha sido <span className="font-bold">baneada permanentemente</span> debido a infracciones graves de nuestras políticas de uso.
                </p>
              </div>
            </div>
          </div>

          {/* Razón del baneo */}
          {user.banReason && (
            <div className="space-y-2">
              <h4 className="text-conexia-green font-bold text-base">Razón del baneo</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{user.banReason}</p>
              </div>
            </div>
          )}

          {/* Consecuencias de la suspensión */}
          <div className="space-y-2">
            <h4 className="text-conexia-green font-bold text-base">Consecuencias de la suspensión</h4>
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div className="flex-1">
                  <ul className="space-y-2 text-sm text-red-800">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tu cuenta ha sido bloqueada permanentemente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Todos tus servicios activos han sido finalizados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>Tus proyectos han sido suspendidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>No podrás acceder nuevamente a la plataforma</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="text-center pt-2">
            <p className="text-sm text-conexia-green">
              ¿Tenés dudas o deseás apelar esta decisión? Podés contactar a nuestro equipo de soporte en{' '}
              <a 
                href="mailto:soporte@conexia.com" 
                className="text-conexia-green hover:underline font-semibold"
              >
                soporte@conexia.com
              </a>
            </p>
          </div>
        </div>

        {/* Footer con botón de cerrar sesión */}
        <div className="p-6 border-t border-gray-200 flex justify-center">
          <button
            onClick={handleLogout}
            className="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-sm shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
