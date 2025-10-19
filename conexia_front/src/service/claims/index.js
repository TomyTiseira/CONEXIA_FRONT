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
 * Subsana un reclamo (actualiza descripción y/o agrega evidencias)
 * Solo puede hacerlo el denunciante cuando el reclamo está en estado "pending_clarification"
 * @param {string} claimId - ID del reclamo
 * @param {FormData} formData - FormData con description (opcional) y/o evidence (archivos, opcional)
 * @returns {Promise<Object>} - Reclamo actualizado con estado "open"
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

const claimsService = {
  createClaim,
  getClaims,
  getClaimsByHiring,
  getClaimById,
  resolveClaim,
  markAsInReview,
  addObservations,
  updateClaim,
};

export default claimsService;
