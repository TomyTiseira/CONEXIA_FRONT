import { config } from '../../config';
import { fetchWithRefresh } from "./fetchWithRefresh";

// Iniciar sesión
export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${config.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // cookies HttpOnly
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al iniciar sesión');
  }

  return res.json(); // si querés mostrar algún mensaje opcional
};

// Refrescar token (cuando accessToken expiró)
export const refreshToken = async () => {
  const res = await fetch(`${config.API_URL}/auth/refresh`, {
    method: 'GET',
    credentials: 'include', // cookies necesarias
  });

  if (!res.ok) {
    throw new Error('No se pudo refrescar el token');
  }

  return res.json();
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    const res = await fetch(`${config.API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    // Si el status es 401 (no autorizado), significa que ya no hay sesión activa
    // No lanzar error en este caso
    if (res.status === 401) {
      console.info('Sesión ya cerrada o expirada');
      return { success: true, message: 'Sesión cerrada' };
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al cerrar sesión');
    }

    return res.json();
  } catch (error) {
    // Si falla la conexión o hay error de red, no bloquear el logout
    console.warn('Error al cerrar sesión en el servidor:', error.message);
    return { success: true, message: 'Sesión cerrada localmente' };
  }
};

export const getProfile = async () => {
  const res = await fetchWithRefresh(`${config.API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("No se pudo obtener el perfil del usuario");
  }

  const data = await res.json();
  return data.data.user;
};