import { config } from '@/config';

export const getAllSkills = async () => {
  const res = await fetch(`${config.API_URL}/users/skills`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error('Error al obtener habilidades');
  }

  return data.data; // array de habilidades [{id, name, ...}]
};
