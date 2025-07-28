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
  const response = await fetch(`${config.API_URL}/users/delete-me`, {
    method: 'POST',
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
