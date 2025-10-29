/**
 * Verifica si una fecha es día hábil (lunes a viernes)
 * @param {Date} date - Fecha a verificar
 * @returns {boolean} true si es día hábil
 */
const isBusinessDay = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Domingo, 6 = Sábado
};

/**
 * Suma días hábiles a una fecha
 * @param {Date} startDate - Fecha inicial
 * @param {number} daysToAdd - Cantidad de días hábiles a sumar
 * @returns {Date} Nueva fecha con los días hábiles sumados
 */
const addBusinessDays = (startDate, daysToAdd) => {
  let currentDate = new Date(startDate);
  let daysAdded = 0;

  while (daysAdded < daysToAdd) {
    currentDate.setDate(currentDate.getDate() + 1);
    if (isBusinessDay(currentDate)) {
      daysAdded++;
    }
  }

  return currentDate;
};

/**
 * Calcula días hábiles entre dos fechas
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {number} Cantidad de días hábiles
 */
const countBusinessDays = (startDate, endDate) => {
  let count = 0;
  let currentDate = new Date(startDate);

  while (currentDate < endDate) {
    if (isBusinessDay(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

/**
 * Calcula los días restantes de vigencia de una cotización
 * @param {Object} quotation - La cotización con quotedAt, quotationValidityDays e isBusinessDays
 * @returns {number|string} Número de días restantes o "N/A"
 */
export const calculateDaysLeft = (quotation) => {
  if (!quotation.quotedAt || !quotation.quotationValidityDays) return "N/A";

  const quotedDate = new Date(quotation.quotedAt);
  const today = new Date();
  
  // Normalizar fechas a medianoche para comparación correcta
  quotedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  let expirationDate;
  
  // Calcular fecha de vencimiento según tipo de días
  if (quotation.isBusinessDays) {
    // Sumar días hábiles
    expirationDate = addBusinessDays(quotedDate, quotation.quotationValidityDays);
  } else {
    // Sumar días corridos
    expirationDate = new Date(quotedDate);
    expirationDate.setDate(expirationDate.getDate() + quotation.quotationValidityDays);
  }

  // Calcular días restantes según tipo de días
  let daysLeft;
  if (quotation.isBusinessDays) {
    // Contar días hábiles restantes
    daysLeft = countBusinessDays(today, expirationDate);
  } else {
    // Contar días corridos restantes
    const diffTime = expirationDate - today;
    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return daysLeft > 0 ? daysLeft : 0;
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
  
  // Determinar el sufijo según el tipo de días
  const dayType = quotation.isBusinessDays ? "días hábiles" : "días";
  const dayText = daysLeft === 1 
    ? (quotation.isBusinessDays ? "día hábil" : "día")
    : dayType;
  
  if (daysLeft <= 2) {
    return {
      text: `${daysLeft} ${dayText}`,
      className: "text-orange-600 font-medium"
    };
  }
  
  return {
    text: `${daysLeft} ${dayText}`,
    className: "text-gray-900"
  };
};