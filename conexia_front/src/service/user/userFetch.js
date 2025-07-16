import { config } from '../../config';

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
