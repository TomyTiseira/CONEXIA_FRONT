import { config } from '@/config';

export async function fetchProjectCategories() {
  const res = await fetch(`${config.API_URL}/projects/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener las categorías');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de categorías');
  return response.data;
}

export async function fetchCollaborationTypes() {
  const res = await fetch(`${config.API_URL}/projects/collaboration-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de colaboración');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de tipos de colaboración');
  return response.data;
}

export async function fetchContractTypes() {
  const res = await fetch(`${config.API_URL}/projects/contract-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('No se pudieron obtener los tipos de contrato');
  const response = await res.json();
  if (!response.success) throw new Error('Error en la respuesta de tipos de contrato');
  return response.data;
}


export async function createProject(formData) {
  const res = await fetch(`${config.API_URL}/projects/publish`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al crear el proyecto');
  }

  return json;
}
