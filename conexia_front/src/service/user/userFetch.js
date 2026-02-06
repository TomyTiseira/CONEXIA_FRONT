import { config } from '../../config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export const fetchPing = async() => {
  const response = await fetch(`${config.API_URL}/users/ping`, {
    cache: 'no-store', 
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const { data } = (await response.json());
  return data;
};

export const registerUser = async ({ email, password, repeatPwd }) => {
  const res = await fetch(`${config.API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      confirmPassword: repeatPwd,
    }),
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.message || "Error al crear usuario");
  }

  return response;
};

// service/user/userFetch.js
export async function verifyUser(data) {
  const res = await fetch(`${config.API_URL}/users/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "No se pudo verificar el código.");
  }

  return res.json();
}

/**
 * Verifica si el usuario tiene un onboarding_token válido
 * Este endpoint es usado para proteger la ruta /profile/create
 * 
 * @returns {Promise<Response>} - Respuesta del fetch (200 si válido, 401 si no)
 */
export async function checkOnboardingStatus() {
  const res = await fetch(`${config.API_URL}/users/onboarding/status`, {
    method: "GET",
    credentials: 'include', // Importante: envía las cookies HttpOnly
  });

  return res;
}

export async function resendVerification(email) {
  const response = await fetch(`${config.API_URL}/users/resend-verification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "No se pudo reenviar el código");
  }

  return data;
}

export async function updatePassword(data) {
  const response = await fetchWithRefresh(`${config.API_URL}/users/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      actualPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.repeatPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'No se pudo actualizar la contraseña');
  }

  return await response.json();
}


export const getRoleById = async (id) => {
    try {
      const res = await fetchWithRefresh(
        `${config.API_URL}/users/get-role-by-id?id=${id}`,
        { method: "GET" }
      );

      if (!res.ok) {
        throw new Error("No se pudo obtener el rol");
      }

      const data = await res.json();
      return data.data.name;
    } catch (error) {
      console.error("Error al obtener el rol:", error);
      return null;
    }
  };

  // Dar de baja usuario (eliminar cuenta propia)
export async function deleteMyUser({ motivo }) {
  const response = await fetchWithRefresh(`${config.API_URL}/users`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: motivo }),
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo dar de baja la cuenta');
  }
  return data;
}

// src/service/users/usersFetch.js

export async function fetchUsers({ search = '', page = 1, limit = 6 } = {}) {
  const url = `${config.API_URL}/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error fetching users');
  const json = await res.json();
  return json?.data?.users || [];
}

/**
 * Obtiene el plan activo del usuario autenticado
 * @returns {Promise<Object>} Información del plan y suscripción del usuario
 */
export async function getUserPlan() {
  try {
    const response = await fetchWithRefresh(`${config.API_URL}/memberships/me/plan`, {
      method: 'GET',
      credentials: 'include',
    });

    // Si no hay respuesta o es un error de red, lanzar error silencioso
    if (!response) {
      const error = new Error('No se pudo conectar con el servidor');
      error.silent = true; // Marcar como error silencioso
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'No se pudo obtener el plan del usuario');
      error.silent = true; // Marcar como error silencioso
      throw error;
    }

    return data.data;
  } catch (error) {
    // Si es un error de red o conexión, marcarlo como silencioso
    if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      error.silent = true;
    }
    throw error;
  }
}
