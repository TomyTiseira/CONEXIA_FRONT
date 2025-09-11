import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear reporte de publicación
export async function createPublicationReport({ publicationId, reason, otherReason, description }) {
	const res = await fetchWithRefresh(`${config.API_URL}/publication-reports`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ publicationId, reason, otherReason, description }),
	});
	const response = await res.json();
	if (!res.ok) throw new Error(response.message || 'Error al crear reporte');
	return response;
}

// Obtener publicaciones reportadas (paginadas y ordenadas)
export async function fetchReportedPublications({ page = 1, limit = 10, orderBy = 'reportCount' } = {}) {
	const res = await fetchWithRefresh(`${config.API_URL}/publication-reports?page=${page}&limit=${limit}&orderBy=${orderBy}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener publicaciones reportadas');
	return res.json();
}

// Obtener detalles de reportes de una publicación específica
export async function fetchPublicationReports(publicationId, page = 1, limit = 10) {
	const res = await fetchWithRefresh(`${config.API_URL}/publication-reports?publicationId=${publicationId}&page=${page}&limit=${limit}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener reportes de la publicación');
	return res.json();
}
