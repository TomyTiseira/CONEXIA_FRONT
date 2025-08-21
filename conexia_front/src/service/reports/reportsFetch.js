import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

// Crear reporte de proyecto
export async function createProjectReport({ projectId, reason, otherReason, description }) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/project`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({ projectId, reason, otherReason, description }),
	});
	const response = await res.json();
	if (!res.ok) throw new Error(response.message || 'Error al crear reporte');
	return response;
}

// Obtener proyectos reportados (paginados y ordenados)
export async function fetchReportedProjects({ page = 1, orderBy = 'reportCount' } = {}) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/project?page=${page}&orderBy=${orderBy}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener proyectos reportados');
	return res.json();
}

// Obtener detalles de reportes de un proyecto específico
export async function fetchProjectReports(projectId, page = 1) {
	const res = await fetchWithRefresh(`${config.API_URL}/reports/project/${projectId}?page=${page}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Error al obtener reportes del proyecto');
	return res.json();
}
