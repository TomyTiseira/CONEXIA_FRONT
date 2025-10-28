import { config } from '@/config';

const API_URL = `${config.API_URL}/service-reviews`;

/**
 * Crear una reseña para un servicio finalizado
 * @param {Object} data - Datos de la reseña
 * @param {number} data.hiringId - ID de la contratación
 * @param {number} data.rating - Calificación (1-5)
 * @param {string} data.comment - Comentario del cliente
 * @returns {Promise<Object>} Reseña creada
 */
export const createServiceReview = async (data) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al crear la reseña');
  }

  return result.data;
};

/**
 * Obtener reseñas de un servicio con paginación
 * @param {number} serviceId - ID del servicio
 * @param {number} page - Página actual (default: 1)
 * @param {number} limit - Límite por página (default: 5)
 * @param {number} rating - Filtrar por calificación específica (1-5) (opcional)
 * @returns {Promise<Object>} Reseñas y metadata
 */
export const getServiceReviews = async (serviceId, page = 1, limit = 5, rating = null) => {
  let url = `${API_URL}/service/${serviceId}?page=${page}&limit=${limit}`;
  
  if (rating !== null && rating >= 1 && rating <= 5) {
    url += `&rating=${rating}`;
  }
  
  const response = await fetch(url, {
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al obtener las reseñas');
  }

  return result.data;
};

/**
 * Obtener la reseña de una contratación específica
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object|null>} Reseña o null si no existe
 */
export const getServiceReviewByHiring = async (hiringId) => {
  const response = await fetch(`${API_URL}/hiring/${hiringId}`, {
    credentials: 'include',
  });

  if (response.status === 404) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al obtener la reseña');
  }

  return result.data;
};

/**
 * Responder a una reseña (solo dueño del servicio)
 * @param {number} reviewId - ID de la reseña
 * @param {string} ownerResponse - Respuesta del dueño
 * @returns {Promise<Object>} Reseña actualizada
 */
export const respondToServiceReview = async (reviewId, ownerResponse) => {
  const response = await fetch(`${API_URL}/${reviewId}/response`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ ownerResponse }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al responder la reseña');
  }

  return result.data;
};

/**
 * Editar una reseña (solo cliente autor)
 * @param {number} reviewId - ID de la reseña
 * @param {Object} data - Datos a actualizar
 * @param {string} data.comment - Nuevo comentario
 * @returns {Promise<Object>} Reseña actualizada
 */
export const updateServiceReview = async (reviewId, data) => {
  const response = await fetch(`${API_URL}/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al actualizar la reseña');
  }

  return result.data;
};

/**
 * Eliminar una reseña (solo cliente autor)
 * @param {number} reviewId - ID de la reseña
 * @returns {Promise<void>}
 */
export const deleteServiceReview = async (reviewId) => {
  const response = await fetch(`${API_URL}/${reviewId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Error al eliminar la reseña');
  }
};

// Exportar también funciones adicionales
export { deleteServiceReviewResponse } from './deleteServiceReviewResponse';
export { reportServiceReview } from './reportServiceReview';
export { getServiceReviewById } from './getServiceReviewById';
