import { refreshToken } from "./authService";

// Variable global para controlar si estamos en proceso de logout
let isLoggingOut = false;

export function setLoggingOut(value) {
  isLoggingOut = value;
}

export async function fetchWithRefresh(url, options = {}, retries = 1) {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
    });

    // No intentar refrescar token si estamos cerrando sesión
    if (res.status === 401 && retries > 0 && !isLoggingOut) {
      try {
        await refreshToken(); // intentá refrescar el token
        return fetchWithRefresh(url, options, retries - 1); // retry original request
      } catch (refreshError) {
        // Si falla el refresh, devolver el 401 original
        return res;
      }
    }

    return res;
  } catch (err) {
    throw new Error("Error en la autenticación");
  }
}
