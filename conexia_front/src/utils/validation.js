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
