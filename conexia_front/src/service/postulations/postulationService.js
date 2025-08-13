import { config } from '../../config';
import { fetchWithRefresh } from '../auth/fetchWithRefresh';

// Postularse a un proyecto
export const applyToProject = async (projectId, cvFile) => {
  const formData = new FormData();
  formData.append('projectId', projectId);
  formData.append('cv', cvFile);

  const res = await fetchWithRefresh(`${config.API_URL}/postulations/apply`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al postularse al proyecto');
  }

  return res.json();
};

// Cancelar postulación
export const cancelPostulation = async (projectId) => {
  const res = await fetchWithRefresh(`${config.API_URL}/postulations/cancel/${projectId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al cancelar postulación');
  }

  return res.json();
};

// Aprobar postulación
export const approvePostulation = async (postulationId) => {
  const res = await fetchWithRefresh(`${config.API_URL}/postulations/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ postulationId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al aprobar postulación');
  }

  return res.json();
};

// Obtener postulaciones de un proyecto
export const getPostulationsByProject = async (projectId, page = 1, statusId = null) => {
  let url = `${config.API_URL}/postulations/project/${projectId}?page=${page}`;
  if (statusId) {
    url += `&statusId=${statusId}`;
  }

  const res = await fetchWithRefresh(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener postulaciones');
  }

  return res.json();
};

// Obtener estados de postulaciones
export const getPostulationStatuses = async () => {
  const res = await fetch(`${config.API_URL}/postulations/statuses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener estados de postulaciones');
  }

  return res.json();
};
