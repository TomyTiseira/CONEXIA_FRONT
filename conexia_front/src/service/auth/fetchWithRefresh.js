import { refreshToken } from "./authService";
import { interceptHttpResponse } from '@/lib/httpInterceptor';

// Variable global para controlar si estamos en proceso de logout
let isLoggingOut = false;

// Contador de errores 401 consecutivos para detectar baneo
let consecutive401Count = 0;
const MAX_401_RETRIES = 2; // Después de 2 intentos, asumir baneo

// Flag para evitar múltiples activaciones del modal
let accessDeniedShown = false;

// Flag global para indicar que la sesión fue terminada (baneo/deshabilitación)
// Los hooks deben verificar esto y silenciar errores
let sessionTerminated = false;

export function setLoggingOut(value) {
  isLoggingOut = value;
  if (value === false) {
    // Reset flags al hacer logout completo
    accessDeniedShown = false;
    consecutive401Count = 0;
    sessionTerminated = false;
  }
}

export function getLoggingOutStatus() {
  return isLoggingOut;
}

export function resetAuthErrorCount() {
  consecutive401Count = 0;
  accessDeniedShown = false;
}

export function isSessionTerminated() {
  return sessionTerminated;
}

export async function fetchWithRefresh(url, options = {}, retries = 1) {
  // Si estamos cerrando sesión, rechazar TODAS las peticiones inmediatamente
  if (isLoggingOut) {
    return new Response(null, { status: 401, statusText: 'Logging out' });
  }
  
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // 🚨 Aplicar interceptor para errores 403 (suspensión/baneo)
    if (res.status === 403) {
      // El interceptor manejará la actualización del store y mostrará toasts
      await interceptHttpResponse(res.clone());
      // Continuar con el manejo existente de 403
    }

    // 🚨 MANEJO EXISTENTE: Errores 403 Forbidden (baneo/suspensión)
    if (res.status === 403) {
      consecutive401Count = 0; // Reset contador
      
      try {
        const errorData = await res.clone().json();
        
        console.log('🔍 Respuesta 403 recibida:', errorData); // Debug
        
        // Usuario baneado - Cerrar sesión y redirigir a login
        if (errorData.reason === 'ACCOUNT_BANNED') {
          console.warn('🚫 Cuenta baneada detectada (403), cerrando sesión...');
          sessionTerminated = true; // Marcar sesión como terminada
          setLoggingOut(true);
          
          // Extraer razón del mensaje si existe
          const banReason = errorData.message?.match(/Razón: ([^.]+)\./)?.[1] || 
                           errorData.banReason || 
                           'Violación de términos de servicio';
          
          // Mostrar modal de acceso denegado
          if (typeof window !== 'undefined' && window.showAccessDenied) {
            window.showAccessDenied({
              title: 'Cuenta Baneada',
              message: 'Tu cuenta ha sido baneada permanentemente y no puede acceder a la plataforma.',
              reason: banReason
            });
          } else {
            // Fallback: redirigir directamente
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = `/login?banned=true&message=${encodeURIComponent(errorData.message || 'Tu cuenta ha sido baneada')}`;
          }
          
          return res;
        }
        
        // Usuario suspendido - Mostrar banner pero permitir navegación
        if (errorData.reason === 'ACCOUNT_SUSPENDED') {
          console.warn('⏸️ Cuenta suspendida detectada');
          // Emitir evento para mostrar banner de suspensión
          if (typeof window !== 'undefined' && window.showSuspensionBanner) {
            window.showSuspensionBanner(errorData.message, errorData.suspensionExpiresAt);
          }
          return res;
        }
        
        // Si es 403 pero sin reason específico, tratar como acceso denegado genérico
        console.warn('⚠️ 403 sin metadata específica:', errorData);
      } catch (parseError) {
        // Si no se puede parsear JSON, devolver respuesta original
        console.error('Error parseando respuesta 403:', parseError);
      }
      
      return res;
    }

    // 401 = Token expirado (aquí SÍ intentar refresh)
    if (res.status === 401 && retries > 0 && !isLoggingOut) {
      consecutive401Count++;
      
      // 🚨 VERIFICAR: ¿El WebSocket ya manejó esto?
      // Si el usuario está suspendido, el WebSocket debió mostrar el modal correcto
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (user?.accountStatus === 'suspended' || user?.isSuspended) {
        console.warn('⏸️ [fetchWithRefresh] Usuario suspendido detectado, NO mostrar modal de "deshabilitada"');
        // NO incrementar contador, el WebSocket debió manejar esto
        consecutive401Count = 0;
        // Retornar 401 original sin modal adicional
        return res;
      }
      
      // 🚨 PROTECCIÓN: Si recibimos múltiples 401 consecutivos, probablemente es baneo
      if (consecutive401Count >= MAX_401_RETRIES && !accessDeniedShown) {
        accessDeniedShown = true; // Marcar para evitar múltiples activaciones
        
        console.info(`🚫 Sesión cerrada: Cuenta deshabilitada (${consecutive401Count} errores de autorización)`);
        
        sessionTerminated = true; // Marcar sesión como terminada
        setLoggingOut(true);
        
        // Mostrar modal de acceso denegado
        if (typeof window !== 'undefined' && window.showAccessDenied) {
          window.showAccessDenied({
            title: 'Cuenta deshabilitada',
            message: 'Tu cuenta ha sido deshabilitada o no tiene autorización para acceder.',
            reason: 'Tu sesión ha sido invalidada por el sistema'
          });
        } else {
          // Fallback
          localStorage.clear();
          sessionStorage.clear();
          window.location.href = '/login?error=unauthorized';
        }
        
        return res;
      }
      
      // Si ya mostramos el modal, solo rechazar silenciosamente
      if (accessDeniedShown || isLoggingOut) {
        return new Response(null, { status: 401, statusText: 'Session terminated' });
      }
      
      try {
        await refreshToken(); // intentá refrescar el token
        const retryRes = await fetchWithRefresh(url, options, retries - 1);
        
        // Si el retry fue exitoso, resetear contador
        if (retryRes.ok) {
          consecutive401Count = 0;
        }
        
        return retryRes;
      } catch (refreshError) {
        // Si falla el refresh, devolver el 401 original
        return res;
      }
    }

    // Si la respuesta es exitosa, resetear contador
    if (res.ok) {
      consecutive401Count = 0;
    }

    return res;
  } catch (err) {
    // Si la sesión fue terminada, no propagar el error
    if (sessionTerminated || isLoggingOut) {
      return new Response(null, { status: 401, statusText: 'Session terminated' });
    }
    throw new Error("Error en la autenticación");
  }
}
