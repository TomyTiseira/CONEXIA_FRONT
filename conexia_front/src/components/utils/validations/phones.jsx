// utils/validations/telefono.js

export function isValidPhoneNumber(phone) {
  // Solo dígitos, entre 10 y 15 caracteres (p. ej. 351xxxxxxx o 116xxxxxxx)
  const regex = /^\d{10,15}$/;
  return regex.test(phone);
}
