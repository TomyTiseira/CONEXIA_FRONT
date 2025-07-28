export function validateEmail(value) {
  if (!value) return "Ingrese un correo electrónico.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Email inválido.";
  return "";
}

export function validatePassword(value) {
  if (!value) return "Ingrese una contraseña.";

  const errors = [];
  if (value.length < 12) errors.push("mín. 12 caracteres");
  if (!/[A-Z]/.test(value)) errors.push("una mayúscula");
  if (!/[a-z]/.test(value)) errors.push("una minúscula");
  if (!/\d/.test(value)) errors.push("un número");
  if (!/[^A-Za-z0-9]/.test(value)) errors.push("un símbolo");

  return errors.length ? `La contraseña debe contener ${errors.join(", ")}.` : "";
}

export function validateRepeatPwd(password, repeat) {
  if (!repeat) return "Repita la contraseña.";
  if (password !== repeat) return "Las contraseñas no coinciden.";
  return "";
}

// Función para validar números de teléfono argentinos
export function validateArgentinaPhone(phone) {
  if (!phone) return false;
  
  // Limpiar el número removiendo espacios, guiones, paréntesis
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Patrones para números argentinos
  const patterns = [
    /^\+54\d{10}$/,           // +54 seguido de 10 dígitos
    /^54\d{10}$/,             // 54 seguido de 10 dígitos
    /^\d{10}$/,               // 10 dígitos directos
    /^11\d{8}$/,              // Buenos Aires: 11 + 8 dígitos
    /^351\d{7}$/,             // Córdoba: 351 + 7 dígitos
    /^341\d{7}$/,             // Rosario: 341 + 7 dígitos
    /^9\d{9}$/,               // Móviles: 9 + 9 dígitos
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

// Validación simple de teléfono: solo verifica que tenga 10 dígitos
export function validateSimplePhone(phone) {
  if (!phone || phone.trim() === '') {
    return {
      isValid: true, // Campo opcional
      message: ''
    };
  }
  
  // Limpiar el teléfono (quitar espacios, guiones, paréntesis)
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Verificar que solo contenga números
  if (!/^\d+$/.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'El teléfono debe contener solo números'
    };
  }
  
  // Verificar que tenga exactamente 10 dígitos
  if (cleanPhone.length !== 10) {
    return {
      isValid: false,
      message: 'El teléfono debe tener exactamente 10 dígitos'
    };
  }
  
  return {
    isValid: true,
    message: 'Número válido'
  };
}

// Función para validar si una fecha es válida
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString().split('T')[0];
}

// Función para verificar si una fecha es actual o futura
export function isCurrentOrFutureDate(dateString) {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
  return inputDate >= today;
}

// Función para calcular la edad
export function calculateAge(birthDate) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}
