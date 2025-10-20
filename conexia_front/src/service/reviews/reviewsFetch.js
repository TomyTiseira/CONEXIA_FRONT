import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

export async function fetchUserReviews(userId, { page = 1, limit = 2 } = {}) {
  const res = await fetchWithRefresh(`${config.API_URL}/users/${userId}/reviews?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener reseñas');
  return response.data;
}

export async function fetchAllUserReviews(userId, page = 1) {
  const res = await fetchWithRefresh(`${config.API_URL}/users/${userId}/reviews?page=${page}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al obtener reseñas');
  return response.data;
}

export async function createReview({ reviewedUserId, relation, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewedUserId, relation, description })
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al crear reseña');
  return response.data;
}

export async function editReview(id, { relation, description }) {
  const res = await fetchWithRefresh(`${config.API_URL}/reviews/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relation, description })
  });
  const response = await res.json();
  if (!res.ok) throw new Error(response.message || 'Error al editar reseña');
  return response.data;
}

export async function deleteReview(id) {
  const res = await fetchWithRefresh(`${config.API_URL}/reviews/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || 'Error al eliminar reseña');
  }
  return true;
}
