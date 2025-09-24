import { config } from '@/config';

/**
 * Crear un nuevo servicio
 * @param {FormData} formData - Datos del formulario con archivos
 * @returns {Promise<Object>} Respuesta del servicio creado
 */
export async function createService(formData) {
  const res = await fetch(`${config.API_URL}/services`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al crear el servicio');
  }

  return json;
}

/**
 * Obtener categorías de servicios
 * @returns {Promise<Object>} Lista de categorías
 */
export async function fetchServiceCategories() {
  const res = await fetch(`${config.API_URL}/services/categories`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener las categorías de servicios');
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error('Error en la respuesta de categorías de servicios');
  }

  // La respuesta tiene la estructura: { success: true, data: { categories: [...] } }
  return response.data.categories;
}