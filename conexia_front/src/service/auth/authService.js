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
  const res = await fetch(`${config.API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Error al cerrar sesión');
  }

  return res.json();
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