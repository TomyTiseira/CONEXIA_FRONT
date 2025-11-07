/**
 * Utilidades para el manejo de planes de suscripción
 */

/**
 * Convierte precio en centavos a formato de moneda
 * @param {number} priceInCents - Precio en centavos (ej: 9999 = $99.99)
 * @returns {string} Precio formateado (ej: "$99.99")
 */
export function formatPlanPrice(priceInCents) {
  if (!priceInCents && priceInCents !== 0) return '$0.00';
  
  const price = priceInCents / 100;
  
  // Usar toLocaleString que es más compatible con Next.js
  return price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calcula el porcentaje de descuento del plan anual vs mensual
 * @param {number} monthlyPrice - Precio mensual en centavos
 * @param {number} annualPrice - Precio anual en centavos
 * @returns {number} Porcentaje de descuento (ej: 17)
 */
export function calculateDiscount(monthlyPrice, annualPrice) {
  if (!monthlyPrice || !annualPrice) return 0;
  
  const monthlyTotal = monthlyPrice * 12;
  const discount = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
  
  return Math.round(discount);
}

/**
 * Calcula la fecha de próxima renovación
 * @param {'monthly'|'annual'} billingCycle - Ciclo de facturación
 * @param {Date} startDate - Fecha de inicio (por defecto: hoy)
 * @returns {Date} Fecha de renovación
 */
export function calculateNextRenewalDate(billingCycle, startDate = new Date()) {
  const renewalDate = new Date(startDate);
  
  if (billingCycle === 'monthly') {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  } else if (billingCycle === 'annual') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  }
  
  return renewalDate;
}

/**
 * Formatea una fecha en formato legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada (ej: "15 de febrero de 2024")
 */
export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verificar que sea una fecha válida
  if (isNaN(dateObj.getTime())) return '';
  
  // Usar toLocaleDateString que es más compatible con Next.js
  return dateObj.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Obtiene el precio según el ciclo de facturación
 * @param {object} plan - Plan con monthlyPrice y annualPrice
 * @param {'monthly'|'annual'} billingCycle - Ciclo de facturación
 * @returns {number} Precio en centavos
 */
export function getPriceForCycle(plan, billingCycle) {
  if (!plan) return 0;
  
  return billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice) 
    : parseFloat(plan.annualPrice);
}
