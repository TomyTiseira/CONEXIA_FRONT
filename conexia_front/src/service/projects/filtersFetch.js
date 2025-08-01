// Obtener tipos de contrato
export async function fetchContractTypes() {
  const res = await fetch('http://localhost:8080/api/projects/contract-types', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener tipos de contrato');
  return await res.json();
}
// Servicio para obtener filtros desde el backend


import { config } from '@/config';

export async function fetchCategories() {
  const res = await fetch(`http://localhost:8080/api/projects/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener categorías');
  return await res.json();
}


export async function fetchSkills() {
  const res = await fetch(`http://localhost:8080/api/users/skills`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener habilidades');
  return await res.json();
}


export async function fetchCollabTypes() {
  const res = await fetch(`http://localhost:8080/api/projects/collaboration-types`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener tipos de colaboración');
  return await res.json();
}
