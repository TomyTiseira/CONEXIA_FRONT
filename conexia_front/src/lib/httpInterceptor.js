/**
 * Interceptor HTTP para manejar errores globales
 * Especialmente errores 403 de usuarios suspendidos/baneados
 */

import { useUserStore } from '@/store/userStore';
import { authSocketService } from '@/service/auth/authSocket.service';

// Sistema de notificaciones global para errores HTTP
let toastCallback = null;

/**
 * Registrar callback para mostrar toasts
 * @param {Function} callback - Función para mostrar toast (type, message)
 */
export function registerToastCallback(callback) {
  toastCallback = callback;
}

/**
 * Mostrar toast si hay callback registrado
 * @param {string} type - Tipo de toast: 'error', 'warning', 'success'
 * @param {string} message - Mensaje a mostrar
 */
function showToast(type, message) {
  if (toastCallback) {
    toastCallback(type, message);
  } else if (typeof window !== 'undefined') {
    // Fallback: guardar en sessionStorage para mostrar después
    sessionStorage.setItem('pendingToast', JSON.stringify({ type, message, timestamp: Date.now() }));
  }
}

/**
 * Interceptor para respuestas HTTP
 * Maneja errores 403 de suspensión/baneo y 401 SESSION_INVALIDATED
 * @param {Response} response - Respuesta HTTP
 * @returns {Response} - Respuesta original
 */
export async function interceptHttpResponse(response) {
  // Manejar 401 SESSION_INVALIDATED (token antiguo detectado)
  if (response.status === 401) {
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      if (data.reason === 'SESSION_INVALIDATED') {
        // Desconectar WebSocket
        authSocketService.disconnect();
        
        // Limpiar tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login?sessionExpired=true';
        }
      }
    } catch (error) {
      // Error processing 401 response
    }
    
    return response;
  }

  // Solo procesar errores 403
  if (response.status !== 403) {
    return response;
  }

  try {
    // Clonar para poder leer el body sin consumirlo
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();

    // Verificar si es error de suspensión/baneo
    if (data.suspended || data.banned || data.reason === 'ACCOUNT_SUSPENDED' || data.reason === 'ACCOUNT_BANNED') {
      
      // Actualizar estado del usuario en Zustand
      const userStore = useUserStore.getState();
      const currentUser = userStore.user;

      if (currentUser && (data.banned || data.reason === 'ACCOUNT_BANNED')) {
        // Usuario BANEADO - mostrar modal bloqueante y forzar logout
        
        userStore.setUser({
          ...currentUser,
          accountStatus: 'banned',
          isBanned: true,
          isSuspended: false,
          suspensionExpiresAt: null,
          suspensionReason: data.message || 'Cuenta suspendida permanentemente',
        });

        // Mostrar modal de baneo (bloqueante)
        authSocketService.showBanModal({
          reason: data.message || 'Violación de términos de servicio',
          message: 'Tu cuenta ha sido suspendida permanentemente',
        });
        
      } else if (currentUser && (data.suspended || data.reason === 'ACCOUNT_SUSPENDED')) {
        // Usuario SUSPENDIDO - actualizar store y mostrar modal informativo
        
        userStore.setUser({
          ...currentUser,
          accountStatus: 'suspended',
          isSuspended: true,
          isBanned: false,
          suspensionExpiresAt: data.suspensionExpiresAt || null,
          suspensionReason: data.message || 'Cuenta suspendida temporalmente',
        });

        // Mostrar modal de suspensión (se puede cerrar)
        authSocketService.showSuspensionModal({
          reason: data.message || 'Violación temporal de las políticas',
          expiresAt: data.suspensionExpiresAt,
          message: 'Tu cuenta está suspendida temporalmente',
        });
        
      } else {
        // Error 403 genérico con metadata de suspensión
        showToast('warning', data.message || 'No tienes permisos para realizar esta acción.');
      }
    } else {
      // Error 403 genérico sin metadata de suspensión
      showToast('error', data.message || 'No tienes permisos para realizar esta acción.');
    }
  } catch (error) {
    // Error al parsear JSON, ignorar
  }

  return response;
}

/**
 * Wrapper para fetch que incluye el interceptor
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Response>} - Respuesta HTTP
 */
export async function fetchWithInterceptor(url, options = {}) {
  const response = await fetch(url, options);
  return interceptHttpResponse(response);
}

/**
 * Recuperar y mostrar toasts pendientes del sessionStorage
 * Útil después de recargas de página
 */
export function showPendingToasts() {
  if (typeof window === 'undefined') return;

  try {
    const pending = sessionStorage.getItem('pendingToast');
    if (pending) {
      const { type, message, timestamp } = JSON.parse(pending);
      // Solo mostrar si es reciente (últimos 5 segundos)
      if (Date.now() - timestamp < 5000) {
        showToast(type, message);
      }
      sessionStorage.removeItem('pendingToast');
    }
  } catch (error) {
  }
}
