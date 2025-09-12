import { config } from '@/config';
import { fetchWithRefresh } from '@/service';

/**
 * Obtiene los comentarios de una publicación
 * @param {number} publicationId - ID de la publicación
 * @param {number} page - Número de página actual (por defecto 1)
 * @param {number} limit - Número de comentarios por página (por defecto 10)
 * @returns {Promise<Object>} - Respuesta con comentarios y paginación
 */
export async function getPublicationComments(publicationId, page = 1, limit = 10) {
  // Llamar a la API para obtener los comentarios
  const url = `${config.API_URL}/publications/${publicationId}/comments?page=${page}&limit=${limit}`;
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error fetching comments');
  }
  
  // Extraer la respuesta completa
  const response = await res.json();
  
  // Importante: Devolvemos la respuesta completa para poder acceder a response.data en el componente
  return response;
}

/**
 * Crea un nuevo comentario en una publicación
 * @param {number} publicationId - ID de la publicación
 * @param {string} content - Contenido del comentario
 * @returns {Promise<Object>} - Comentario creado
 */
export async function createComment(publicationId, content) {
  
  if (!content || content.trim().length === 0) {
    throw new Error('El contenido del comentario no puede estar vacío');
  }
  
  // Convertir ID a número si es necesario
  if (typeof publicationId === 'string') {
    publicationId = Number(publicationId);
  }
  
  const url = `${config.API_URL}/publications/${publicationId}/comments`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Error creating comment';
    throw new Error(errorMessage);
  }
  
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return await res.json();
}

/**
 * Actualiza un comentario existente
 * @param {number} commentId - ID del comentario
 * @param {string} content - Nuevo contenido del comentario
 * @returns {Promise<Object>} - Comentario actualizado
 */
export async function updateComment(commentId, content) {
  const url = `${config.API_URL}/publications/comments/${commentId}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error updating comment');
  }
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return await res.json();
}

/**
 * Elimina un comentario
 * @param {number} commentId - ID del comentario a eliminar
 * @returns {Promise<Object>} - Mensaje de éxito
 */
export async function deleteComment(commentId) {
  const url = `${config.API_URL}/publications/comments/${commentId}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error deleting comment');
  }
  // Devolvemos la respuesta completa para mantener la estructura anidada
  return await res.json();
}
