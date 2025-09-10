import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear reporte de publicación
export async function createPublicationReport({ publicationId, reason, otherReason, description }) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/publication`, {
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
export async function fetchReportedPublications({ page = 1, orderBy = 'reportCount' } = {}) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/publication?page=${page}&orderBy=${orderBy}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener publicaciones reportadas');
	return res.json();
}

// Obtener detalles de reportes de una publicación específica
export async function fetchPublicationReports(publicationId, page = 1) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/publication/${publicationId}?page=${page}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener reportes de la publicación');
	return res.json();
}
