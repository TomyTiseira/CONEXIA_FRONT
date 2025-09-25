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

/**
 * Obtener servicios con filtros y paginación
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Límite de resultados por página
 * @returns {Promise<Object>} Lista de servicios con paginación
 */
export async function fetchServices(filters = {}) {
  const { title, category, priceMin, priceMax, sortBy, page = 1, limit = 12, includeInactive = false } = filters;
  
  const params = new URLSearchParams();
  
  if (title) params.append('title', title);
  if (category && category.length > 0) params.append('category', category.join(','));
  if (priceMin !== undefined && priceMin !== '') params.append('priceMin', priceMin);
  if (priceMax !== undefined && priceMax !== '') params.append('priceMax', priceMax);
  if (sortBy) params.append('sortBy', sortBy);
  if (includeInactive) params.append('includeInactive', 'true');
  
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const res = await fetch(`${config.API_URL}/services?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los servicios');
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error('Error en la respuesta de servicios');
  }

  return response.data;
}

/**
 * Obtener servicios de un usuario específico
 * @param {number} userId - ID del usuario
 * @param {Object} filters - Filtros adicionales
 * @returns {Promise<Object>} Lista de servicios del usuario con paginación
 */
export async function fetchUserServices(userId, filters = {}) {
  const { page = 1, limit = 12, includeInactive = false } = filters;
  
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (includeInactive) params.append('includeInactive', 'true');

  const res = await fetch(`${config.API_URL}/services/profile/${userId}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('No se pudieron obtener los servicios del usuario');
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error('Error en la respuesta de servicios del usuario');
  }

  return response.data;
}

/**
 * Obtener detalle de un servicio específico
 * @param {number} serviceId - ID del servicio
 * @returns {Promise<Object>} Detalle del servicio
 */
export async function fetchServiceDetail(serviceId) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el detalle del servicio');
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error('Error en la respuesta del detalle del servicio');
  }

  return response.data;
}

/**
 * Editar un servicio existente
 * @param {number} serviceId - ID del servicio
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Servicio actualizado
 */
export async function updateService(serviceId, data) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al actualizar el servicio');
  }

  return json;
}

/**
 * Eliminar un servicio
 * @param {number} serviceId - ID del servicio
 * @param {string} reason - Motivo de eliminación
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export async function deleteService(serviceId, reason) {
  const res = await fetch(`${config.API_URL}/services/${serviceId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al eliminar el servicio');
  }

  return json;
}