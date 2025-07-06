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