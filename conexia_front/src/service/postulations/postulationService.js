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
