/**
 * Obtiene la etiqueta en español para una unidad de tiempo
 * @param {string} timeUnit - La unidad de tiempo ('hours', 'days', 'weeks', 'months')
 * @param {number} quantity - La cantidad para determinar singular/plural
 * @returns {string} La etiqueta en español
 */
export const getUnitLabel = (timeUnit, quantity = 1) => {
  if (quantity === 1) {
    const labels = {
      hours: "hora",
      days: "día", 
      weeks: "semana",
      months: "mes",
    };
    return labels[timeUnit] || timeUnit;
  } else {
    const labels = {
      hours: "horas",
      days: "días",
      weeks: "semanas",
      months: "meses",
    };
    return labels[timeUnit] || timeUnit;
  }
};

/**
 * Obtiene la etiqueta en plural para una unidad de tiempo
 * @param {string} timeUnit - La unidad de tiempo ('hours', 'days', 'weeks', 'months')
 * @returns {string} La etiqueta en plural
 */
export const getUnitLabelPlural = (timeUnit) => {
  const labels = {
    hours: "horas",
    days: "días",
    weeks: "semanas",
    months: "meses",
  };
  return labels[timeUnit] || timeUnit;
};

/**
 * Obtiene todas las opciones de unidades de tiempo
 * @returns {Array} Array de objetos con value y label
 */
export const getTimeUnitOptions = () => [
  { value: 'hours', label: 'Horas' },
  { value: 'days', label: 'Días' },
  { value: 'weeks', label: 'Semanas' },
  { value: 'months', label: 'Meses' }
];