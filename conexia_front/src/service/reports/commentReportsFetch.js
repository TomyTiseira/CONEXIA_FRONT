import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear reporte de comentario
export async function createCommentReport({ commentId, reason, otherReason, description }) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/comment`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ commentId, reason, otherReason, description }),
	});
	const response = await res.json();
	if (!res.ok) throw new Error(response.message || 'Error al crear reporte');
	return response;
}

// Obtener comentarios reportados (paginados y ordenados)
export async function fetchReportedComments({ page = 1, limit = 10, orderBy = 'reportCount' } = {}) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/comment?page=${page}&limit=${limit}&orderBy=${orderBy}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener comentarios reportados');
	return res.json();
}

// Obtener detalles de reportes de un comentario específico
export async function fetchCommentReports(commentId, page = 1, limit = 10) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/comment/${commentId}?page=${page}&limit=${limit}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener reportes del comentario');
	return res.json();
}
