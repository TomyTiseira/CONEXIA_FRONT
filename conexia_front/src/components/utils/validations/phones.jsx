// utils/validations/telefono.js

/**
 * Valida números de teléfono argentinos
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - True si es válido, false si no
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remover espacios, guiones y paréntesis comunes
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Patrones para números argentinos
  const patterns = [
    // Teléfonos móviles: 9 + código de área + número (11 dígitos total)
    // Ejemplo: 93514567890 (Córdoba), 91145678901 (Buenos Aires)
    /^9(11|220|221|223|261|291|341|351|376|379|381|383|385|387|388|2202|2221|2254|2281|2302|2317|2320|2324|2326|2334|2335|2336|2337|2364|2396|2473|2474|2477|2478|2622|2623|2624|2625|2627|2634|2635|2901|2902|2920|2922|2928|2929|2931|2932|2940|2945|2946|2948|2952|2953|2954|2962|2963|2964|2966|2972|3327|3329|3382|3385|3387|3388|3400|3401|3402|3404|3405|3406|3407|3408|3409|3435|3436|3437|3438|3444|3446|3447|3448|3454|3455|3456|3458|3460|3462|3463|3464|3465|3466|3467|3468|3469|3471|3472|3476|3482|3483|3487|3489|3491|3492|3493|3496|3498|3564|3571|3572|3573|3574|3575|3576|3582|3584|3585|3711|3715|3716|3717|3718|3721|3725|3731|3734|3735|3743|3751|3755|3756|3757|3758|3772|3773|3774|3775|3777|3781|3782|3786|3821|3822|3825|3826|3827|3832|3835|3841|3843|3844|3845|3846|3854|3855|3856|3857|3858|3860|3862|3863|3865|3867|3868|3869|3876|3877|3884|3885|3886|3887|3888|3891|3892|3894)\d{7,8}$/,
    
    // Teléfonos fijos: código de área + número
    // Buenos Aires: 11 + 8 dígitos = 10 total
    /^11\d{8}$/,
    // Córdoba: 351 + 7 dígitos = 10 total
    /^351\d{7}$/,
    // Rosario: 341 + 7 dígitos = 10 total  
    /^341\d{7}$/,
    // Mendoza: 261 + 7 dígitos = 10 total
    /^261\d{7}$/,
    // Otros códigos de 3 dígitos + 7 dígitos
    /^(220|221|223|291|376|379|381|383|385|387|388)\d{7}$/,
    // Códigos de 4 dígitos + 6 dígitos
    /^(2202|2221|2254|2281|2302|2317|2320|2324|2326|2334|2335|2336|2337|2364|2396|2473|2474|2477|2478|2622|2623|2624|2625|2627|2634|2635|2901|2902|2920|2922|2928|2929|2931|2932|2940|2945|2946|2948|2952|2953|2954|2962|2963|2964|2966|2972|3327|3329|3382|3385|3387|3388|3400|3401|3402|3404|3405|3406|3407|3408|3409|3435|3436|3437|3438|3444|3446|3447|3448|3454|3455|3456|3458|3460|3462|3463|3464|3465|3466|3467|3468|3469|3471|3472|3476|3482|3483|3487|3489|3491|3492|3493|3496|3498|3564|3571|3572|3573|3574|3575|3576|3582|3584|3585|3711|3715|3716|3717|3718|3721|3725|3731|3734|3735|3743|3751|3755|3756|3757|3758|3772|3773|3774|3775|3777|3781|3782|3786|3821|3822|3825|3826|3827|3832|3835|3841|3843|3844|3845|3846|3854|3855|3856|3857|3858|3860|3862|3863|3865|3867|3868|3869|3876|3877|3884|3885|3886|3887|3888|3891|3892|3894)\d{6}$/
  ];
  
  return patterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Obtiene información sobre el formato correcto del teléfono según la región
 * @param {string} phone - Número parcial para determinar la región
 * @returns {string} - Mensaje explicativo del formato esperado
 */
export function getPhoneFormatInfo(phone) {
  if (!phone) return "Número de teléfono requerido";
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si empieza con 11 (Buenos Aires)
  if (cleanPhone.startsWith('11')) {
    if (cleanPhone.length < 10) {
      return "Faltan dígitos. Formato: 11 + 8 dígitos";
    } else if (cleanPhone.length > 10) {
      return "Demasiados dígitos. Formato: 11 + 8 dígitos";
    }
    return "Buenos Aires: formato correcto";
  } 
  // Si empieza con 351 (Córdoba)
  else if (cleanPhone.startsWith('351')) {
    if (cleanPhone.length < 10) {
      return "Faltan dígitos. Formato: 351 + 7 dígitos";
    } else if (cleanPhone.length > 10) {
      return "Demasiados dígitos. Formato: 351 + 7 dígitos";
    }
    return "Córdoba: formato correcto";
  }
  // Si empieza con 341 (Rosario)
  else if (cleanPhone.startsWith('341')) {
    if (cleanPhone.length < 10) {
      return "Faltan dígitos. Formato: 341 + 7 dígitos";
    } else if (cleanPhone.length > 10) {
      return "Demasiados dígitos. Formato: 341 + 7 dígitos";
    }
    return "Rosario: formato correcto";
  }
  // Si empieza con 261 (Mendoza)
  else if (cleanPhone.startsWith('261')) {
    if (cleanPhone.length < 10) {
      return "Faltan dígitos. Formato: 261 + 7 dígitos";
    } else if (cleanPhone.length > 10) {
      return "Demasiados dígitos. Formato: 261 + 7 dígitos";
    }
    return "Mendoza: formato correcto";
  }
  // Si empieza con 9 (móvil)
  else if (cleanPhone.startsWith('9')) {
    if (cleanPhone.length < 11) {
      return "Faltan dígitos. Formato: 9 + área + número";
    } else if (cleanPhone.length > 11) {
      return "Demasiados dígitos. Formato: 9 + área + número";
    }
    return "Móvil: verificar código de área";
  }
  // Si no coincide con ningún patrón conocido
  else {
    // Determinar qué podría ser según la longitud
    if (cleanPhone.length <= 3) {
      return "Código de área incompleto";
    } else {
      return "Código de área no válido. Use: 11, 351, 341 o 9xxx";
    }
  }
}

/**
 * Valida y proporciona información detallada sobre un número de teléfono
 * @param {string} phone - Número de teléfono a validar
 * @returns {object} - Objeto con información de validación
 */
export function validatePhoneWithInfo(phone) {
  const isValid = isValidPhoneNumber(phone);
  const formatInfo = getPhoneFormatInfo(phone);
  
  return {
    isValid,
    formatInfo,
    message: isValid ? "Número válido" : formatInfo
  };
}
