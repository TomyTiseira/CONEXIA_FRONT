import { config } from "@/config";

export const requestPasswordReset = async (email) => {
  const res = await fetch(`${config.API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "No se pudo enviar el código");
  return data;
};

export const verifyResetCode = async ({ email, verificationCode }) => {
  const res = await fetch(`${config.API_URL}/auth/verify-code-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, verificationCode }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Código incorrecto o expirado");
  return data;
};

export const resetPassword = async ({ email, password, confirmPassword }) => {
  const res = await fetch(`${config.API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al cambiar contraseña");
  return data;
};
