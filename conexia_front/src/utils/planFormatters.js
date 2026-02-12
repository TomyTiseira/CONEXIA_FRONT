/**
 * Utilidades para formatear información de planes y suscripciones
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea la fecha de "Miembro desde" en formato legible
 * @param {Date|string} date - Fecha de alta del usuario
 * @returns {string} - Fecha formateada (ej: "Marzo 2024")
 */
export const formatMemberSince = (date) => {
  if (!date) return 'Fecha no disponible';
  
  try {
    const formatted = format(new Date(date), "MMMM yyyy", { locale: es });
    // Capitalizar la primera letra del mes
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  } catch (error) {
    return 'Fecha no disponible';
  }
};

/**
 * Formatea un monto de dinero con símbolo de moneda
 * @param {number} amount - Monto a formatear
 * @param {string} currency - Código de moneda (default: 'ARS')
 * @returns {string} - Monto formateado (ej: "$1,999.00 ARS")
 */
export const formatCurrency = (amount, currency = 'ARS') => {
  if (amount === null || amount === undefined) return 'No disponible';
  
  try {
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    return `$${formatted} ${currency}`;
  } catch (error) {
    return `$${amount} ${currency}`;
  }
};

/**
 * Formatea los últimos 4 dígitos de una tarjeta
 * @param {string} lastFour - Últimos 4 dígitos de la tarjeta
 * @returns {string} - Número formateado (ej: "•••• •••• •••• 4242")
 */
export const formatCardNumber = (lastFour) => {
  if (!lastFour) return 'No disponible';
  return `•••• •••• •••• ${lastFour}`;
};

/**
 * Formatea una fecha de pago en formato legible
 * @param {Date|string} date - Fecha del próximo pago
 * @returns {string} - Fecha formateada (ej: "15 de Diciembre, 2024")
 */
export const formatPaymentDate = (date) => {
  if (!date) return 'No disponible';
  
  try {
    return format(new Date(date), "d 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    return 'Fecha no disponible';
  }
};

/**
 * Obtiene el nombre legible de la marca de tarjeta
 * @param {string} brand - Código de la marca (ej: 'visa', 'mastercard')
 * @returns {string} - Nombre formateado (ej: 'VISA', 'MasterCard')
 */
export const formatCardBrand = (brand) => {
  if (!brand) return '';
  
  const brandNames = {
    'visa': 'VISA',
    'mastercard': 'MasterCard',
    'amex': 'American Express',
    'maestro': 'Maestro',
    'discover': 'Discover',
    'diners': 'Diners Club',
    'jcb': 'JCB',
    'unionpay': 'UnionPay',
  };
  
  return brandNames[brand.toLowerCase()] || brand.toUpperCase();
};

/**
 * Obtiene el texto y estilo según el estado de la suscripción
 * @param {string} status - Estado de la suscripción
 * @returns {Object} - Objeto con label, colorClass, bgClass, icon
 */
export const getSubscriptionStatusInfo = (status) => {
  const statusMap = {
    'active': {
      label: 'Activa',
      colorClass: 'text-green-700',
      bgClass: 'bg-green-100',
      borderClass: 'border-green-300',
      icon: ''
    },
    'pending_payment': {
      label: 'Pago pendiente',
      colorClass: 'text-yellow-700',
      bgClass: 'bg-yellow-100',
      borderClass: 'border-yellow-300',
      icon: '⏳'
    },
    'payment_failed': {
      label: 'Pago fallido',
      colorClass: 'text-red-700',
      bgClass: 'bg-red-100',
      borderClass: 'border-red-300',
      icon: '❌'
    },
    'cancelled': {
      label: 'Cancelada',
      colorClass: 'text-gray-700',
      bgClass: 'bg-gray-100',
      borderClass: 'border-gray-300',
      icon: '🚫'
    },
    'expired': {
      label: 'Vencida',
      colorClass: 'text-orange-700',
      bgClass: 'bg-orange-100',
      borderClass: 'border-orange-300',
      icon: '⌛'
    },
    'replaced': {
      label: 'Reemplazada',
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-100',
      borderClass: 'border-blue-300',
      icon: '🔄'
    }
  };
  
  return statusMap[status] || {
    label: 'Desconocido',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    borderClass: 'border-gray-300',
    icon: '❓'
  };
};

/**
 * Obtiene el tipo de método de pago legible
 * @param {string} type - Tipo de método de pago
 * @returns {string} - Tipo formateado
 */
export const formatPaymentMethodType = (type) => {
  if (!type) return 'Método de pago';
  
  const typeNames = {
    'credit_card': 'Tarjeta de Crédito',
    'debit_card': 'Tarjeta de Débito',
    'bank_transfer': 'Transferencia Bancaria',
    'digital_wallet': 'Billetera Digital',
  };
  
  return typeNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Formatea valores de beneficios tipo enum a texto legible
 * @param {string} key - Clave del beneficio
 * @param {*} value - Valor del beneficio (puede ser string, number, boolean)
 * @returns {string} - Valor formateado
 */
export const formatBenefitValue = (key, value) => {
  // Si es boolean o number, no hay que formatear el display especial aquí
  if (typeof value === 'boolean' || typeof value === 'number') {
    return null; // Se maneja directamente en los componentes
  }

  // Para valores tipo string (enums)
  if (typeof value === 'string') {
    // Mapeo específico para search_visibility
    if (key === 'search_visibility') {
      const visibilityMap = {
        'estandar': 'Estándar',
        'alta': 'Alta',
        'prioridad_maxima': 'Prioridad máxima'
      };
      return visibilityMap[value] || value.replace(/_/g, ' ');
    }

    // Mapeo genérico para otros enums
    if (key === 'metrics_access') {
      const metricsMap = {
        'basico': 'Básico',
        'avanzado': 'Avanzado',
        'avanzadas': 'Avanzadas',
        'completo': 'Completo',
        'completas': 'Completas'
      };
      return metricsMap[value] || value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Por defecto, reemplazar guiones bajos y capitalizar
    return value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  return value;
};

/**
 * Determina si un beneficio está activo/disponible
 * @param {*} value - Valor del beneficio
 * @returns {boolean} - true si el beneficio está activo
 */
export const isBenefitActive = (value) => {
  // Boolean true = activo
  if (typeof value === 'boolean') {
    return value === true;
  }
  
  // Number > 0 = activo
  if (typeof value === 'number') {
    return value > 0;
  }
  
  // String no vacío = activo (para enums)
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  // Por defecto inactivo
  return false;
};
