/**
 * Utilidad para manejar errores específicos del sistema de planes
 */

/**
 * Analiza y formatea mensajes de error de la API de planes
 * @param {Object} error - Objeto de error de la API
 * @returns {Object} - { title: string, message: string, type: 'error'|'warning' }
 */
export function handlePlanError(error) {
  // Estructura de error del backend
  const errorMessage = error.message || error.error || 'Error desconocido';
  const errorStatus = error.status || error.statusCode;
  const errorCode = error.code;

  // 1. Error de sincronización con MercadoPago
  if (errorCode === 'MERCADOPAGO_SYNC_ERROR' || errorMessage.includes('MercadoPago')) {
    
    // Caso 1: CVV no validado
    if (errorMessage.includes('cvv') || errorMessage.includes('CVV') || 
        errorMessage.includes('security code')) {
      return {
        title: 'Error en los datos de la tarjeta',
        message: 'Hubo un problema al validar tu tarjeta. Por favor verifica los datos e intenta nuevamente.',
        type: 'error',
      };
    }
    
    // Caso 2: Precio menor al mínimo
    if (errorMessage.includes('Cannot pay an amount lower than') || 
        errorMessage.includes('mínimo $15')) {
      return {
        title: 'Precio inválido',
        message: 'Los precios deben ser mayores o iguales a $15 ARS. MercadoPago no acepta montos menores.',
        type: 'warning',
      };
    }
    
    // Caso 3: URL inválida
    if (errorMessage.includes('URL de retorno') || 
        errorMessage.includes('back url')) {
      return {
        title: 'Error de configuración',
        message: 'Las URLs de retorno no están configuradas correctamente. Contacta al administrador del sistema.',
        type: 'error',
      };
    }
    
    // Caso 4: Credenciales inválidas
    if (errorMessage.includes('credentials') || 
        errorMessage.includes('Credenciales')) {
      return {
        title: 'Error de autenticación',
        message: 'Las credenciales de MercadoPago son inválidas. Contacta al administrador del sistema.',
        type: 'error',
      };
    }

    // Caso 5: Error genérico de MercadoPago
    return {
      title: 'Error al procesar el pago',
      message: 'No se pudo procesar el pago. Por favor verifica los datos de tu tarjeta e intenta nuevamente.',
      type: 'error',
    };
  }

  // 2. Beneficio no encontrado
  if (errorStatus === 404 && errorMessage.includes('Benefit')) {
    return {
      title: 'Beneficio no encontrado',
      message: 'Uno o más beneficios seleccionados no existen. Recarga la página e intenta nuevamente.',
      type: 'error',
    };
  }

  // 3. Plan no encontrado
  if (errorStatus === 404 && errorMessage.includes('Plan')) {
    return {
      title: 'Plan no encontrado',
      message: 'El plan que intentas contratar no existe o ya no está disponible.',
      type: 'error',
    };
  }

  // 4. Suscripción ya existente
  if (errorStatus === 409 || errorMessage.includes('ya tienes una suscripción')) {
    return {
      title: 'Suscripción activa',
      message: 'Ya tienes una suscripción activa a este plan. Cancela tu suscripción actual antes de contratar un nuevo plan.',
      type: 'warning',
    };
  }

  // 5. Error de validación general (400)
  if (errorStatus === 400) {
    return {
      title: 'Datos inválidos',
      message: errorMessage || 'Los datos proporcionados son inválidos. Verifica e intenta nuevamente.',
      type: 'warning',
    };
  }

  // 6. Error de tokenización de tarjeta
  if (errorMessage.includes('cardToken') || errorMessage.includes('tarjeta')) {
    return {
      title: 'Error en los datos de la tarjeta',
      message: 'No se pudo procesar la información de tu tarjeta. Verifica los datos e intenta nuevamente.',
      type: 'error',
    };
  }

  // 7. Error de permisos
  if (errorStatus === 403) {
    return {
      title: 'Acceso denegado',
      message: 'No tienes permisos para realizar esta acción.',
      type: 'error',
    };
  }

  // 8. Error de autenticación
  if (errorStatus === 401) {
    return {
      title: 'Sesión expirada',
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      type: 'error',
    };
  }

  // 9. Error de servidor (500)
  if (errorStatus >= 500) {
    return {
      title: 'Error del servidor',
      message: 'Ocurrió un error en el servidor. Por favor intenta nuevamente más tarde.',
      type: 'error',
    };
  }

  // 10. Error desconocido
  return {
    title: 'Error',
    message: errorMessage || 'Ocurrió un error inesperado. Por favor intenta nuevamente.',
    type: 'error',
  };
}

/**
 * Valida los precios de un plan antes de enviarlo
 * @param {number} monthlyPrice - Precio mensual
 * @param {number} annualPrice - Precio anual
 * @returns {Object|null} - { isValid: boolean, error?: { title, message, type } }
 */
export function validatePlanPrices(monthlyPrice, annualPrice) {
  const MIN_PRICE = 15;

  if (monthlyPrice < MIN_PRICE) {
    return {
      isValid: false,
      error: {
        title: 'Precio mensual inválido',
        message: `El precio mensual debe ser mayor o igual a $${MIN_PRICE} ARS`,
        type: 'warning',
      },
    };
  }

  if (annualPrice < MIN_PRICE) {
    return {
      isValid: false,
      error: {
        title: 'Precio anual inválido',
        message: `El precio anual debe ser mayor o igual a $${MIN_PRICE} ARS`,
        type: 'warning',
      },
    };
  }

  if (monthlyPrice <= 0 || annualPrice <= 0) {
    return {
      isValid: false,
      error: {
        title: 'Precios inválidos',
        message: 'Los precios deben ser mayores a cero',
        type: 'warning',
      },
    };
  }

  return { isValid: true };
}

/**
 * Obtiene un mensaje de error amigable para mostrar al usuario
 * @param {Object} error - Objeto de error
 * @returns {string} - Mensaje formateado
 */
export function getErrorMessage(error) {
  const { title, message } = handlePlanError(error);
  return `${title}: ${message}`;
}
