import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export async function fetchUserReviews(userId, { page = 1, limit = 2 } = {}) {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews/${userId}?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener reseñas');
  
  // Mapear la respuesta del backend al formato esperado por el frontend
  return {
    reviews: response.data.reviews || [],
    pagination: {
      page: response.data.pagination.currentPage,
      totalPages: response.data.pagination.totalPages,
      hasNext: response.data.pagination.hasNextPage,
      hasPrev: response.data.pagination.hasPreviousPage
    }
  };
}

export async function fetchAllUserReviews(userId, page = 1) {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews/${userId}?page=${page}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener reseñas');
  
  // Mapear la respuesta del backend al formato esperado por el frontend
  return {
    reviews: response.data.reviews || [],
    pagination: {
      page: response.data.pagination.currentPage,
      totalPages: response.data.pagination.totalPages,
      hasNext: response.data.pagination.hasNextPage,
      hasPrev: response.data.pagination.hasPreviousPage
    }
  };
}

export async function createReview({ reviewedUserId, relationship, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      reviewedUserId: Number(reviewedUserId), 
      relationship, 
      description 
    })
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al crear reseña');
  return response.data;
}

export async function editReview(id, { relationship, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationship, description })
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al editar reseña');
  return response.data;
}

export async function deleteReview(id) {
  const res = await fetchWithRefresh(`${config.API_URL}/user-reviews/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || 'Error al eliminar reseña');
  }
  return true;
}
