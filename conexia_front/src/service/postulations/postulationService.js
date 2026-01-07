import { config } from '../../config';
import { fetchWithRefresh } from '../auth/fetchWithRefresh';

/**
 * Postularse a un rol de un proyecto
 * @param {Object} applicationData - Datos de la postulación
 * @param {number} applicationData.projectId - ID del proyecto
 * @param {number} applicationData.roleId - ID del rol
 * @param {File} [applicationData.cv] - Archivo CV (opcional)
 * @param {Array} [applicationData.answers] - Respuestas a preguntas (opcional)
 * @param {string} [applicationData.partnerDescription] - Descripción para socio (opcional)
 * @param {string} [applicationData.investorMessage] - Mensaje para inversor (opcional)
 * @param {number} [applicationData.investorAmount] - Monto de inversión (opcional)
 */
export const applyToProjectRole = async (applicationData) => {
  // Determinar si necesitamos FormData o JSON
  const hasFile = applicationData.cv;
  
  if (hasFile) {
    // Si hay archivo, usar FormData
    const formData = new FormData();
    
    // Campos obligatorios
    formData.append('projectId', applicationData.projectId);
    formData.append('roleId', applicationData.roleId);
    
    // CV
    formData.append('cv', applicationData.cv);
    
    // Respuestas a preguntas (como JSON string en FormData)
    if (applicationData.answers && applicationData.answers.length > 0) {
      formData.append('answers', JSON.stringify(applicationData.answers));
    }
    
    // Campos para socio
    if (applicationData.partnerDescription !== undefined) {
      formData.append('partnerDescription', applicationData.partnerDescription);
    }
    
    // Campos para inversor
    if (applicationData.investorMessage !== undefined) {
      formData.append('investorMessage', applicationData.investorMessage);
    }
    if (applicationData.investorAmount !== undefined) {
      formData.append('investorAmount', applicationData.investorAmount);
    }

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
  } else {
    // Sin archivo, usar JSON puro
    const jsonData = {
      projectId: applicationData.projectId,
      roleId: applicationData.roleId
    };
    
    // Respuestas a preguntas
    if (applicationData.answers && applicationData.answers.length > 0) {
      jsonData.answers = applicationData.answers;
    }
    
    // Campos para socio
    if (applicationData.partnerDescription !== undefined) {
      jsonData.partnerDescription = applicationData.partnerDescription;
    }
    
    // Campos para inversor
    if (applicationData.investorMessage !== undefined) {
      jsonData.investorMessage = applicationData.investorMessage;
    }
    if (applicationData.investorAmount !== undefined) {
      jsonData.investorAmount = applicationData.investorAmount;
    }

    const res = await fetchWithRefresh(`${config.API_URL}/postulations/apply`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jsonData),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Error al postularse al proyecto');
    }

    return res.json();
  }
};

// Mantener compatibilidad con código antiguo
export const applyToProject = async (projectId, cvFile, roleId = null) => {
  const applicationData = {
    projectId,
    cv: cvFile
  };
  
  if (roleId) {
    applicationData.roleId = roleId;
  }
  
  return applyToProjectRole(applicationData);
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

/**
 * Enviar prueba técnica para una postulación
 * @param {number} postulationId - ID de la postulación
 * @param {Object} evaluationData - Datos de la evaluación
 * @param {number} evaluationData.projectId - ID del proyecto
 * @param {number} evaluationData.roleId - ID del rol
 * @param {string} [evaluationData.evaluationDescription] - Descripción (opcional)
 * @param {string} [evaluationData.evaluationLink] - Link (opcional)
 * @param {File} [evaluationData.evaluation] - Archivo (opcional, pdf/png/jpg)
 */
export const submitTechnicalEvaluation = async (postulationId, evaluationData) => {
  const formData = new FormData();
  
  // Campos obligatorios
  formData.append('projectId', evaluationData.projectId);
  formData.append('roleId', evaluationData.roleId);
  
  // Al menos uno de los siguientes es necesario
  if (evaluationData.evaluationDescription) {
    formData.append('evaluationDescription', evaluationData.evaluationDescription);
  }
  
  if (evaluationData.evaluationLink) {
    formData.append('evaluationLink', evaluationData.evaluationLink);
  }
  
  if (evaluationData.evaluation) {
    formData.append('evaluation', evaluationData.evaluation);
  }
  
  // Validar que al menos uno de los campos opcionales esté presente
  if (!evaluationData.evaluationDescription && !evaluationData.evaluationLink && !evaluationData.evaluation) {
    throw new Error('Debes proporcionar al menos una descripción, link o archivo de la evaluación');
  }

  const res = await fetchWithRefresh(`${config.API_URL}/postulations/${postulationId}/submit-evaluation`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al enviar la evaluación técnica');
  }

  return res.json();
};

/**
 * Obtener postulaciones de un usuario por proyecto específico y roleId
 * Útil para verificar si un usuario ya se postuló a un rol específico
 */
export const getMyPostulationsByProjectAndRole = async (projectId, roleId) => {
  try {
    let page = 1;
    const postulations = [];
    const maxPages = 10;
    
    while (page <= maxPages) {
      const response = await getMyPostulations(page);
      
      if (!response.success || !response.data.postulations.length) {
        break;
      }
      
      // Buscar postulaciones que coincidan con proyecto y rol
      const matchingPostulations = response.data.postulations.filter(
        postulation => 
          postulation.projectId === parseInt(projectId) && 
          postulation.roleId === parseInt(roleId)
      );
      
      postulations.push(...matchingPostulations);
      
      // Si no hay más páginas, salir del bucle
      if (!response.data.pagination.hasNextPage) {
        break;
      }
      
      page++;
    }
    
    return postulations;
  } catch (error) {
    throw new Error('Error al obtener postulaciones');
  }
};
