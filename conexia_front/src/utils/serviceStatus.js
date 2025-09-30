/**
 * Utilitarios para manejar el estado de servicios y cotizaciones
 */

/**
 * Determina si un servicio puede recibir cotizaciones
 * @param {Object} service - El servicio a evaluar
 * @returns {boolean}
 */
export const canReceiveQuotations = (service) => {
  return service?.status === 'active' && !service?.hasPendingQuotation && !service?.hasActiveQuotation;
};

/**
 * Determina si un servicio tiene una cotización pendiente
 * @param {Object} service - El servicio a evaluar
 * @returns {boolean}
 */
export const hasPendingQuotation = (service) => {
  return service?.hasPendingQuotation === true;
};

/**
 * Determina si un servicio tiene una cotización activa
 * @param {Object} service - El servicio a evaluar
 * @returns {boolean}
 */
export const hasActiveQuotation = (service) => {
  return service?.hasActiveQuotation === true;
};

/**
 * Obtiene el texto del botón de cotización según el estado del servicio
 * @param {Object} service - El servicio a evaluar
 * @returns {string}
 */
export const getQuotationButtonText = (service) => {
  if (hasPendingQuotation(service)) {
    return 'Cancelar Solicitud';
  }
  
  if (hasActiveQuotation(service)) {
    return 'Cotización en curso';
  }
  
  return 'Cotizar';
};

/**
 * Obtiene la variante del botón según el estado del servicio
 * @param {Object} service - El servicio a evaluar
 * @returns {string}
 */
export const getQuotationButtonVariant = (service) => {
  if (hasPendingQuotation(service)) {
    return 'danger';
  }
  
  if (hasActiveQuotation(service)) {
    return 'secondary';
  }
  
  return 'neutral';
};

/**
 * Determina si el botón de cotización debe estar deshabilitado
 * @param {Object} service - El servicio a evaluar
 * @returns {boolean}
 */
export const isQuotationButtonDisabled = (service) => {
  return hasActiveQuotation(service);
};