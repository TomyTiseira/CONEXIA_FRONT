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

// Cancelar postulación por ID (nueva API)
export const cancelPostulation = async (postulationId) => {
  const res = await fetchWithRefresh(`${config.API_URL}/postulations/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ postulationId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al cancelar postulación');
  }

  return res.json();
};

// Alias para compatibilidad
export const cancelPostulationById = cancelPostulation;

// Rechazar postulación
export const rejectPostulation = async (postulationId) => {
  const res = await fetchWithRefresh(`${config.API_URL}/postulations/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ postulationId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al rechazar postulación');
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

// Obtener mis postulaciones
export const getMyPostulations = async (page = 1) => {
  const res = await fetchWithRefresh(`${config.API_URL}/postulations/me?page=${page}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener mis postulaciones');
  }

  return res.json();
};

// Obtener postulación activa por projectId (para cancelar)
export const getMyActivePostulationByProject = async (projectId) => {
  try {
    // Buscamos en las primeras páginas (máximo 3 páginas para optimizar)
    let page = 1;
    let foundPostulation = null;
    const maxPages = 3;
    
    while (!foundPostulation && page <= maxPages) {
      const response = await getMyPostulations(page);
      
      if (!response.success || !response.data.postulations.length) {
        break;
      }
      
      // Buscar la postulación activa para este proyecto
      foundPostulation = response.data.postulations.find(
        postulation => postulation.projectId === parseInt(projectId) && 
        postulation.status.code === 'activo'
      );
      
      // Si no hay más páginas, salir del bucle
      if (!response.data.pagination.hasNextPage) {
        break;
      }
      
      page++;
    }
    
    return foundPostulation;
  } catch (error) {
    throw new Error('Error al obtener la postulación activa');
  }
};

// Obtener cualquier postulación por projectId (para verificar si ya se postuló)
export const getMyPostulationByProject = async (projectId, exhaustiveSearch = false) => {
  try {
    let page = 1;
    let foundPostulation = null;
    // Si es búsqueda exhaustiva, buscar en todas las páginas, sino máximo 5 páginas
    const maxPages = exhaustiveSearch ? 50 : 5;
    
    while (!foundPostulation && page <= maxPages) {
      const response = await getMyPostulations(page);
      
      if (!response.success || !response.data.postulations.length) {
        break;
      }
      
      // Buscar cualquier postulación para este proyecto (sin importar el estado)
      foundPostulation = response.data.postulations.find(
        postulation => postulation.projectId === parseInt(projectId)
      );
      
      // Si no hay más páginas, salir del bucle
      if (!response.data.pagination.hasNextPage) {
        break;
      }
      
      page++;
    }
    
    return foundPostulation;
  } catch (error) {
    throw new Error('Error al obtener la postulación');
  }
};
