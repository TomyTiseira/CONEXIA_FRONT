import { io } from 'socket.io-client';
import { config } from '@/config/env';

/**
 * Servicio de WebSocket para notificaciones de autenticación en tiempo real
 * Maneja suspensiones, baneos y reactivaciones
 */
class AuthSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.modalContainer = null;
  }

  /**
   * Conectar al WebSocket después del login exitoso
   * No necesita token explícito - usa cookies HttpOnly con withCredentials: true
   */
  connect() {
    if (this.socket?.connected) {
      return;
    }

    // Obtener URL base del backend (sin /api)
    const BACKEND_URL = config.API_URL.replace('/api', '');

    this.socket = io(`${BACKEND_URL}/auth-events`, {
      withCredentials: true,  // ✅ Envía cookies HttpOnly automáticamente
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // Evento: Conexión exitosa
    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
    });

    // Evento: Cambio en estado de cuenta
    this.socket.on('account-status-changed', (data) => {
      this.handleAccountStatusChange(data);
    });

    // Evento: Error de conexión
    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });

    // Evento: Desconexión
    this.socket.on('disconnect', (reason) => {
      // Si el servidor cerró la conexión (token inválido, etc.)
      if (reason === 'io server disconnect') {
        this.disconnect();
      }
    });
    
    // Evento: Error general
    this.socket.on('error', (error) => {
      console.error('[❌ AuthSocket] Error en el socket:', error);
    });
  }

  /**
   * Manejar cambios de estado de cuenta
   */
  handleAccountStatusChange(data) {
    switch (data.type) {
      case 'ACCOUNT_SUSPENDED':
        this.handleSuspension(data);
        break;
      case 'ACCOUNT_BANNED':
        this.handleBan(data);
        break;
      case 'ACCOUNT_REACTIVATED':
        this.handleReactivation(data);
        break;
    }
  }

  /**
   * Usuario fue suspendido - MANTENER SESIÓN pero mostrar modal
   */
  handleSuspension(data) {
    // Actualizar estado del usuario en localStorage (NO cerrar sesión)
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.accountStatus = 'suspended';
        user.isSuspended = true;
        user.isBanned = false;
        user.suspensionExpiresAt = data.expiresAt;
        user.suspensionReason = data.reason;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('[❌ AuthSocket] Error actualizando usuario:', e);
      }
    }

    // Mostrar modal informativo
    this.showSuspensionModal({
      reason: data.reason,
      expiresAt: data.expiresAt,
      message: data.message,
    });
  }

  /**
   * Usuario fue baneado - MODAL BLOQUEANTE + LOGOUT FORZADO
   */
  handleBan(data) {
    // Actualizar estado del usuario en localStorage para evitar que BannedAccountModal se muestre también
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.accountStatus = 'banned';
        user.isBanned = true;
        user.banReason = data.reason;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('[❌ AuthSocket] Error actualizando usuario:', e);
      }
    }

    // Mostrar modal bloqueante del WebSocket
    this.showBanModal({
      reason: data.reason,
      message: data.message,
    });
  }

  /**
   * Usuario fue reactivado - MOSTRAR MODAL de bienvenida
   */
  handleReactivation(data) {
    // Actualizar estado del usuario
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        user.accountStatus = 'active';
        user.isSuspended = false;
        user.isBanned = false;
        user.suspensionExpiresAt = null;
        user.suspensionReason = null;
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('Error actualizando usuario:', e);
      }
    }

    // Mostrar modal de reactivación
    this.showReactivationModal();
  }

  /**
   * Modal BLOQUEANTE para baneo (NO se puede cerrar)
   */
  showBanModal(config) {
    // Eliminar modal anterior si existe
    this.removeModal();

    const modal = document.createElement('div');
    modal.id = 'conexia-ban-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4 font-sans';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header con gradiente rojo -->
        <div class="p-8 bg-gradient-to-r from-red-500 to-red-600">
          <h3 class="text-white text-2xl font-bold text-center">Cuenta suspendida permanentemente</h3>
        </div>

        <!-- Contenido con scroll -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          <!-- Alert banner principal -->
          <div class="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-red-800 text-sm leading-relaxed">
                  Tu cuenta ha sido <span class="font-bold">baneada permanentemente</span> debido a infracciones graves de nuestras políticas de uso.
                </p>
              </div>
            </div>
          </div>

          <!-- Razón del baneo -->
          <div class="space-y-2">
            <h4 class="text-conexia-green font-bold text-base">Razón del baneo</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p class="text-gray-700 text-sm">${config.reason}</p>
            </div>
          </div>

          <!-- Consecuencias de la suspensión -->
          <div class="space-y-2">
            <h4 class="text-conexia-green font-bold text-base">Consecuencias de la suspensión</h4>
            <div class="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                  <ul class="space-y-2 text-sm text-red-800">
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Tu cuenta ha sido bloqueada permanentemente</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Todos tus servicios activos han sido finalizados</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Tus proyectos han sido suspendidos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>No podrás acceder nuevamente a la plataforma</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Información de contacto -->
          <div class="text-center pt-2">
            <p class="text-sm text-conexia-green">
              ¿Tenés dudas o deseás apelar esta decisión? Podés contactar a nuestro equipo de soporte en <a href="mailto:soporte@conexia.com" class="text-conexia-green hover:underline font-semibold">soporte@conexia.com</a>
            </p>
          </div>
        </div>

        <!-- Footer con botón de cerrar sesión -->
        <div class="p-6 border-t border-gray-200 flex justify-center">
          <button
            id="conexia-ban-logout-btn"
            class="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-sm shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalContainer = modal;

    // Event listener para el botón de cerrar sesión
    const logoutBtn = document.getElementById('conexia-ban-logout-btn');
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Deshabilitar el botón inmediatamente
        logoutBtn.disabled = true;
        logoutBtn.style.opacity = '0.5';
        logoutBtn.style.cursor = 'not-allowed';
        
        this.forceLogout('banned');
        return false;
      };
    }
  }

  /**
   * Modal INFORMATIVO para suspensión (se puede cerrar)
   */
  showSuspensionModal(config) {
    // Eliminar modal anterior si existe
    this.removeModal();

    const expirationDate = config.expiresAt
      ? new Date(config.expiresAt).toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'fecha no especificada';

    const modal = document.createElement('div');
    modal.id = 'conexia-suspension-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sans';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header con gradiente amarillo -->
        <div class="p-8 bg-gradient-to-r from-amber-400 to-amber-500">
          <h3 class="text-white text-2xl font-bold text-center">Cuenta Suspendida Temporalmente</h3>
        </div>

        <!-- Contenido con scroll -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          <!-- Alert banner principal -->
          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-amber-800 text-sm leading-relaxed">
                  Tu cuenta ha sido <span class="font-bold">suspendida temporalmente</span>. Algunas funciones estarán restringidas hasta la fecha de expiración.
                </p>
                <div class="mt-3 flex items-center gap-2">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span class="text-sm font-semibold text-amber-900">Expira: ${expirationDate}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Motivo -->
          <div class="space-y-2">
            <h4 class="text-conexia-green font-bold text-base">Motivo</h4>
            <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p class="text-gray-700 text-sm">${config.reason}</p>
            </div>
          </div>

          <!-- Durante la suspensión -->
          <div class="space-y-4">
            <h4 class="text-conexia-green font-bold text-base">Durante la suspensión</h4>

            <!-- Lo que NO puede hacer -->
            <div class="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                  <h5 class="font-semibold text-red-900 mb-2 text-sm">No puedes hacer:</h5>
                  <ul class="space-y-2 text-sm text-red-800">
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Publicar nuevos servicios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Publicar nuevos proyectos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Postularte a proyectos de otros usuarios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Recibir nuevas postulaciones en tus proyectos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Solicitar cotizaciones en servicios de otros usuarios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Recibir solicitudes de cotización en tus servicios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-red-600 font-bold">•</span>
                      <span>Crear publicaciones en comunidad</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Lo que SÍ puede hacer -->
            <div class="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                  <h5 class="font-semibold text-green-900 mb-2 text-sm">Puedes hacer:</h5>
                  <ul class="space-y-2 text-sm text-green-800">
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Completar tus proyectos y servicios actuales</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Comunicarte con tus clientes y colaboradores actuales</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Ver tu perfil y contenido existente</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Acceder a tus mensajes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Mensaje de reactivación -->
            <div class="bg-conexia-soft border border-conexia-green/20 rounded-lg p-4">
              <p class="text-sm text-conexia-green text-center">
                <span class="font-semibold">Tu cuenta se reactivará automáticamente</span> cuando finalice el período de suspensión.
              </p>
            </div>

            <!-- Información de contacto -->
            <div class="text-center pt-2">
              <p class="text-sm text-conexia-green">
                ¿Tenés dudas o deseás apelar esta decisión? Podés contactar a nuestro equipo de soporte en <a href="mailto:soporte@conexia.com" class="text-conexia-green hover:underline font-semibold">soporte@conexia.com</a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer con botón -->
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <button
            id="conexia-suspension-ok-btn"
            class="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalContainer = modal;

    // Evento del botón Entendido
    const okBtn = document.getElementById('conexia-suspension-ok-btn');
    
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        this.removeModal();
        window.location.reload();
      });
    }
  }

  /**
   * Modal de REACTIVACIÓN (cuenta restaurada)
   */
  showReactivationModal() {
    // Eliminar modal anterior si existe
    this.removeModal();

    const modal = document.createElement('div');
    modal.id = 'conexia-reactivation-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 font-sans';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header con gradiente verde -->
        <div class="p-8 bg-gradient-to-r from-green-500 to-green-600">
          <h3 class="text-white text-2xl font-bold text-center">Cuenta Reactivada</h3>
        </div>

        <!-- Contenido con scroll -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-4">
          <!-- Alert banner principal -->
          <div class="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-green-800 text-sm leading-relaxed">
                  Tu cuenta ha sido <span class="font-bold">reactivada exitosamente</span>. Ya podés usar todas las funciones de la plataforma sin restricciones.
                </p>
              </div>
            </div>
          </div>

          <!-- Permisos restaurados -->
          <div class="space-y-2">
            <h4 class="text-conexia-green font-bold text-base">Permisos restaurados</h4>
            <div class="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div class="flex-1">
                  <ul class="space-y-2 text-sm text-green-800">
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Publicar servicios y proyectos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Postularte a proyectos de otros usuarios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Recibir nuevas postulaciones en tus proyectos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Solicitar cotizaciones en servicios de otros usuarios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Recibir solicitudes de cotización en tus servicios</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-green-600 font-bold">•</span>
                      <span>Crear publicaciones en comunidad</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer con botón -->
        <div class="p-6 border-t border-gray-200 flex justify-end">
          <button
            id="conexia-reactivation-ok-btn"
            class="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 text-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.modalContainer = modal;

    // Evento del botón Entendido
    const okBtn = document.getElementById('conexia-reactivation-ok-btn');
    
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        this.removeModal();
        window.location.reload();
      });
    }
  }

  /**
   * Forzar cierre de sesión (solo para baneo)
   */
  async forceLogout(reason = 'banned') {
    // Marcar con flag global que estamos haciendo logout
    if (typeof window !== 'undefined') {
      window.__CONEXIA_FORCE_LOGOUT__ = true;
      window.__CONEXIA_LOGGING_OUT__ = true;
    }
    
    // Remover modal PRIMERO
    this.removeModal();
    
    // Desconectar WebSocket inmediatamente
    if (this.socket) {
      try {
        this.socket.disconnect();
        this.socket = null;
      } catch (e) {
        console.error('Error desconectando socket:', e);
      }
    }
    
    // 1. Llamar al backend para DESTRUIR las cookies HttpOnly
    try {
      await fetch(`${config.API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[❌ AuthSocket] Error al cerrar sesión en backend:', error);
      // Continuar de todas formas
    }
    
    // 2. Limpiar TODO localStorage y sessionStorage
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Restaurar flag después de clear
      sessionStorage.setItem('logout-in-progress', 'true');
    } catch (e) {
      console.error('Error limpiando storage:', e);
    }

    // 3. Redirigir al home
    window.location.replace('/');
  }

  /**
   * Remover modal del DOM
   */
  removeModal() {
    if (this.modalContainer) {
      this.modalContainer.remove();
      this.modalContainer = null;
    }

    // Remover cualquier modal que exista
    const existingModals = document.querySelectorAll(
      '#conexia-ban-modal, #conexia-suspension-modal, #conexia-reactivation-modal'
    );
    existingModals.forEach((modal) => modal.remove());
  }

  /**
   * Desconectar WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Verificar si está conectado
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Exportar instancia singleton
export const authSocketService = new AuthSocketService();
