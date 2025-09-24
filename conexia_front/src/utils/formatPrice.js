/**
 * Formatea un precio con formato de moneda local
 * @param {string|number} price - El precio a formatear
 * @returns {string} El precio formateado
 */
export function formatPrice(price) {
  if (!price && price !== 0) return '$0';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '$0';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}