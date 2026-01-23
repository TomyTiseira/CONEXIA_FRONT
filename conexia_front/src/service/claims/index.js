/**
 * Claims API Service
 * Servicios para gestión de reclamos
 */

import { config } from '@/config/env';

const API_URL = `${config.API_URL}/claims`;

/**
 * Crea un nuevo reclamo con archivos de evidencia
 * @param {Object} claimData - Datos del reclamo
 * @param {number} claimData.hiringId - ID de la contratación
 * @param {string} claimData.claimType - Tipo de reclamo
 * @param {string} claimData.description - Descripción del reclamo
 * @param {string} claimData.otherReason - Motivo especificado cuando claimType es "Otro" (opcional, máx 30 chars)
 * @param {File[]} claimData.files - Archivos de evidencia (opcional, máximo 10)
 * @returns {Promise<Object>} - Reclamo creado con URLs de evidencia
 */
export const createClaim = async (claimData) => {
  try {
    const formData = new FormData();
    
    // Agregar campos del claim
    formData.append('hiringId', claimData.hiringId.toString());
    formData.append('claimType', claimData.claimType);
    formData.append('description', claimData.description);
    
    // Agregar otherReason si está presente (cuando claimType es client_other o provider_other)
    if (claimData.otherReason) {
      formData.append('otherReason', claimData.otherReason);
    }
    
    // Agregar archivos de evidencia (si hay)
    if (claimData.files && claimData.files.length > 0) {
      claimData.files.forEach((file) => {
        formData.append('evidence', file);
      });
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // No incluir Content-Type header, el browser lo agrega automáticamente con el boundary
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al crear el reclamo');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in createClaim:', error);
    throw error;
  }
};

/**
 * Obtiene lista de reclamos (admin/moderador)
 * @param {Object} filters - Filtros
 * @param {string} filters.searchTerm - Buscar por ID del reclamo (completo o parcial)
 * @param {number} filters.hiringId - Filtrar por contratación
 * @param {string} filters.status - Filtrar por estado
 * @param {string} filters.claimantRole - Filtrar por rol del reclamante
 * @param {number} filters.page - Página
 * @param {number} filters.limit - Límite por página
 * @returns {Promise<Object>} - Lista de reclamos con paginación
 */
export const getClaims = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.searchTerm) queryParams.append('searchTerm', filters.searchTerm);
    if (filters.hiringId) queryParams.append('hiringId', filters.hiringId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.claimantRole) queryParams.append('claimantRole', filters.claimantRole);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener los reclamos');
    }

    // El backend devuelve { success, data: { claims, pages, total } }
    return result.data;
  } catch (error) {
    console.error('Error in getClaims:', error);
    throw error;
  }
};

/**
 * Obtiene reclamos de una contratación específica
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Array>} - Lista de reclamos
 */
export const getClaimsByHiring = async (hiringId) => {
  try {
    const response = await fetch(`${API_URL}/hiring/${hiringId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener los reclamos');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in getClaimsByHiring:', error);
    throw error;
  }
};

/**
 * Obtiene un reclamo por ID
 * @param {string} claimId - ID del reclamo
 * @returns {Promise<Object>} - Datos del reclamo
 */
export const getClaimById = async (claimId) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}`, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener el reclamo');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in getClaimById:', error);
    throw error;
  }
};

/**
 * Resuelve o rechaza un reclamo (admin/moderador)
 * @param {string} claimId - ID del reclamo
 * @param {Object} resolutionData - Datos de la resolución
 * @param {string} resolutionData.status - "resolved" o "rejected"
 * @param {string} resolutionData.resolution - Texto de la resolución
 * @returns {Promise<Object>} - Reclamo actualizado
 */
export const resolveClaim = async (claimId, resolutionData) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}/resolve`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(resolutionData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al resolver el reclamo');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in resolveClaim:', error);
    throw error;
  }
};

/**
 * Marca un reclamo como "En Revisión" (admin/moderador)
 * @param {string} claimId - ID del reclamo
 * @returns {Promise<Object>} - Reclamo actualizado
 */
export const markAsInReview = async (claimId) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}/review`, {
      method: 'PATCH',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al marcar como en revisión');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in markAsInReview:', error);
    throw error;
  }
};

/**
 * Agrega observaciones a un reclamo (admin/moderador)
 * Cambia el estado a "Pendiente subsanación"
 * @param {string} claimId - ID del reclamo
 * @param {Object} observationsData - Datos de las observaciones
 * @param {string} observationsData.observations - Texto de las observaciones (20-2000 chars)
 * @returns {Promise<Object>} - Reclamo actualizado
 */
export const addObservations = async (claimId, observationsData) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}/observations`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(observationsData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al agregar observaciones');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in addObservations:', error);
    throw error;
  }
};

/**
 * Subsana un reclamo (agrega respuesta a observaciones y/o nuevas evidencias)
 * Solo puede hacerlo el denunciante cuando el reclamo está en estado "pending_clarification"
 * @param {string} claimId - ID del reclamo
 * @param {FormData} formData - FormData con:
 *   - clarificationResponse (opcional, 50-2000 chars)
 *   - evidence (opcional, hasta 5 archivos)
 *   Debe enviarse al menos uno de los dos.
 * @returns {Promise<Object>} - Reclamo actualizado
 */
export const updateClaim = async (claimId, formData) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}/update`, {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
      // No incluir Content-Type header, el browser lo agrega automáticamente con el boundary
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al subsanar el reclamo');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in updateClaim:', error);
    throw error;
  }
};

/**
 * Obtiene los reclamos del usuario actual (como reclamante o reclamado)
 * @param {Object} filters - Filtros
 * @param {number} filters.page - Página (default: 1)
 * @param {number} filters.limit - Límite por página (default: 12)
 * @param {string} filters.status - Filtrar por estado
 * @param {string} filters.role - Filtrar por rol: 'claimant', 'respondent', 'all' (default: 'all')
 * @param {string} filters.sortBy - Ordenar por: 'createdAt', 'updatedAt' (default: 'createdAt')
 * @param {string} filters.sortOrder - Orden: 'asc', 'desc' (default: 'desc')
 * @returns {Promise<Object>} - { claims: Array, pagination: Object }
 */
export const getMyClaims = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append('page', filters.page || 1);
    queryParams.append('limit', filters.limit || 12);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.role) queryParams.append('role', filters.role);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const url = `${API_URL}/my-claims?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener mis reclamos');
    }

    return result.data;
  } catch (error) {
    console.error('Error in getMyClaims:', error);
    throw error;
  }
};

/**
 * Obtiene el detalle completo de un reclamo
 * Incluye toda la información: evidencias, observaciones, resolución, cumplimiento
 * @param {string|number} claimId - ID del reclamo
 * @returns {Promise<Object>} - Detalle completo del reclamo
 */
export const getClaimDetail = async (claimId) => {
  try {
    const response = await fetch(`${API_URL}/${claimId}/detail`, {
      method: 'GET',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener detalle del reclamo');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in getClaimDetail:', error);
    throw error;
  }
};

/**
 * El reclamado envía observaciones al reclamo
 * Solo disponible cuando el status es 'pending'
 * @param {string|number} claimId - ID del reclamo
 * @param {Object|FormData} data - Datos de las observaciones
 * @param {string} data.observations - Texto de las observaciones (50-2000 chars)
 * @param {File[]} data.evidenceFiles - Archivos de evidencia (opcional, máximo 5)
 * @returns {Promise<Object>} - Reclamo actualizado
 */
export const submitObservations = async (claimId, data) => {
  try {
    const formData = new FormData();
    
    if (typeof data === 'string') {
      formData.append('observations', data);
    } else if (data instanceof FormData) {
      return await fetch(`${API_URL}/${claimId}/observations`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Error al enviar observaciones');
        }
        return result.data || result;
      });
    } else {
      formData.append('observations', data.observations);
      
      // Agregar archivos si existen
      if (data.evidenceFiles && data.evidenceFiles.length > 0) {
        data.evidenceFiles.forEach((file) => {
          formData.append('evidenceFiles', file);
        });
      }
    }

    const response = await fetch(`${API_URL}/${claimId}/observations`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al enviar observaciones');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in submitObservations:', error);
    throw error;
  }
};

/**
 * El reclamado sube el cumplimiento del reclamo
 * Solo disponible cuando existe un compliance asociado
 * @param {string|number} claimId - ID del reclamo
 * @param {Object|FormData} data - Datos del cumplimiento
 * @param {string} data.description - Descripción del cumplimiento (50+ chars)
 * @param {File[]} data.evidenceFiles - Archivos de evidencia (opcional, máximo 5)
 * @returns {Promise<Object>} - Compliance actualizado
 */
export const submitCompliance = async (claimId, data) => {
  try {
    const formData = new FormData();
    
    if (data instanceof FormData) {
      return await fetch(`${API_URL}/${claimId}/compliance/submit`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Error al enviar cumplimiento');
        }
        return result.data || result;
      });
    }
    
    formData.append('description', data.description);
    
    // Agregar archivos si existen
    if (data.evidenceFiles && data.evidenceFiles.length > 0) {
      data.evidenceFiles.forEach((file) => {
        formData.append('evidence', file);
      });
    }

    const response = await fetch(`${API_URL}/${claimId}/compliance/submit`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al enviar cumplimiento');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error in submitCompliance:', error);
    throw error;
  }
};

const claimsService = {
  createClaim,
  getClaims,
  getClaimsByHiring,
  getClaimById,
  resolveClaim,
  markAsInReview,
  addObservations,
  updateClaim,
  getMyClaims,
  getClaimDetail,
  submitObservations,
  submitCompliance,
};

export default claimsService;
