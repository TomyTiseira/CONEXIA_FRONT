import { config } from '../../config';

// obtener ping desde el backend
export const fetchPing = async() => {
  const response = await fetch(`${config.API_URL}/users/ping`, {
    cache: 'no-store', // Para evitar el caché en desarrollo
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

