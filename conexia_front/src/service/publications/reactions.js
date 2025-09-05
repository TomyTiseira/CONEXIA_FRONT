import { config } from '@/config';
import { fetchWithRefresh } from '@/service';

/**
 * Obtiene las reacciones de una publicación
 * @param {number} publicationId - ID de la publicación
 * @param {number} page - Número de página actual (por defecto 1)
 * @param {number} limit - Número de reacciones por página (por defecto 10)
 * @returns {Promise<Object>} - Respuesta con reacciones, resumen y paginación
 */
export async function getPublicationReactions(publicationId, page = 1, limit = 10, params = {}) {
  let queryParams = `page=${page}&limit=${limit}`;
  
  // Agregar parámetros adicionales si están presentes
  // Si params.type existe y no es 'all', lo añadimos al querystring
  if (params.type && params.type !== 'all') {
    queryParams += `&type=${params.type}`;
  }
  
  const url = `${config.API_URL}/publications/${publicationId}/reactions?${queryParams}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error fetching reactions');
  }
  
  // Extraer la respuesta completa
  const response = await res.json();
  
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return response;
}

/**
 * Crea o actualiza una reacción en una publicación
 * @param {number} publicationId - ID de la publicación
 * @param {string} type - Tipo de reacción ('like', 'love', 'support', 'celebrate', 'insightful')
 * @returns {Promise<Object>} - Reacción creada o actualizada
 */
export async function createOrUpdateReaction(publicationId, type) {
  // Validar que el tipo sea uno de los permitidos
  const allowedTypes = ['like', 'love', 'support', 'celebrate', 'insightful'];
  if (!allowedTypes.includes(type)) {
    throw new Error(`Tipo de reacción inválido. Debe ser uno de: ${allowedTypes.join(', ')}`);
  }
  
  // Convertir ID a número si es necesario
  if (typeof publicationId === 'string') {
    publicationId = Number(publicationId);
  }
  
  const url = `${config.API_URL}/publications/${publicationId}/reactions`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error creating/updating reaction');
  }
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return await res.json();
}

/**
 * Elimina una reacción
 * @param {number} reactionId - ID de la reacción a eliminar
 * @returns {Promise<Object>} - Mensaje de éxito
 */
export async function deleteReaction(reactionId) {
  const url = `${config.API_URL}/publications/reactions/${reactionId}`;
  const res = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error deleting reaction');
  }
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return await res.json();
}
