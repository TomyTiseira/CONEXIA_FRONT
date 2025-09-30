/**
 * Calcula los días restantes de vigencia de una cotización
 * @param {Object} quotation - La cotización con quotedAt y quotationValidityDays
 * @returns {number|string} Número de días restantes o "N/A"
 */
export const calculateDaysLeft = (quotation) => {
  if (!quotation.quotedAt || !quotation.quotationValidityDays) return "N/A";

  const quotedDate = new Date(quotation.quotedAt);
  const expirationDate = new Date(quotedDate);
  expirationDate.setDate(expirationDate.getDate() + quotation.quotationValidityDays);

  const today = new Date();
  const diffTime = expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

/**
 * Verifica si una cotización está vencida
 * @param {Object} quotation - La cotización a verificar
 * @returns {boolean} true si está vencida
 */
export const isExpired = (quotation) => {
  return quotation.isExpired || calculateDaysLeft(quotation) <= 0;
};

/**
 * Obtiene el estado de vigencia para mostrar en UI
 * @param {Object} quotation - La cotización
 * @returns {Object} Objeto con texto y clase CSS
 */
export const getVigencyStatus = (quotation) => {
  if (isExpired(quotation)) {
    return {
      text: "Vencida",
      className: "text-red-600 font-medium"
    };
  }
  
  const daysLeft = calculateDaysLeft(quotation);
  if (daysLeft === "N/A") {
    return {
      text: "N/A",
      className: "text-gray-500"
    };
  }
  
  if (daysLeft <= 2) {
    return {
      text: `${daysLeft} días`,
      className: "text-orange-600 font-medium"
    };
  }
  
  return {
    text: `${daysLeft} días`,
    className: "text-gray-900"
  };
};