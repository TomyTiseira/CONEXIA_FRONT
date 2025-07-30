import { config } from '@/config'; // o definí la URL directa si no tenés este archivo

export async function createProject(formData) {
  const res = await fetch(`${config.API_URL}/projects`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error || 'Error al crear el proyecto');
  }

  return json;
}
