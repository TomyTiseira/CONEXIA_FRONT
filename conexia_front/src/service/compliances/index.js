/**
 * Compliances API Service
 * Servicios para gestión de cumplimientos de reclamos
 */

import { config } from '@/config/env';

const API_URL = `${config.API_URL}/compliances`;

/**
 * Obtiene lista de compliances con filtros
 * @param {Object} filters - Filtros opcionales
 * @param {string} filters.claimId - ID del reclamo
 * @param {string} filters.userId - ID del usuario responsable
 * @param {string} filters.status - Estado(s) del compliance (separados por coma)
 * @param {boolean} filters.onlyOverdue - Solo vencidos
 * @param {number} filters.page - Página (default: 1)
 * @param {number} filters.limit - Límite por página (default: 10)
 * @returns {Promise<Object>} - { data: Compliance[], total, page, limit, totalPages }
 */
export const getCompliances = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.claimId) queryParams.append('claimId', filters.claimId);
    if (filters.userId) queryParams.append('userId', filters.userId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.onlyOverdue) queryParams.append('onlyOverdue', 'true');
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const url = `${API_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener los cumplimientos');
    }

    return result;
  } catch (error) {
    console.error('Error in getCompliances:', error);
    throw error;
  }
};

/**
 * Obtiene detalle de un compliance específico
 * @param {string} complianceId - UUID del compliance
 * @returns {Promise<Object>} - Compliance detallado
 */
export const getComplianceById = async (complianceId) => {
  try {
    const response = await fetch(`${API_URL}/${complianceId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener el cumplimiento');
    }

    return result;
  } catch (error) {
    console.error('Error in getComplianceById:', error);
    throw error;
  }
};

/**
 * Envía evidencia de cumplimiento (usuario responsable)
 * @param {string} complianceId - UUID del compliance
 * @param {Object} data - Datos del envío
 * @param {string} data.userId - ID del usuario
 * @param {string} data.userNotes - Notas/explicación (opcional)
 * @param {File[]} data.files - Archivos de evidencia
 * @returns {Promise<Object>} - Compliance actualizado
 */
export const submitCompliance = async (complianceId, data) => {
  try {
    const formData = new FormData();
    
    formData.append('userId', data.userId);
    
    if (data.userNotes) {
      formData.append('userNotes', data.userNotes);
    }

    // Agregar archivos
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => {
        formData.append('evidence', file);
      });
    }

    const response = await fetch(`${API_URL}/${complianceId}/submit`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // No incluir Content-Type, el browser lo agrega automáticamente
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al enviar evidencia');
    }

    return result;
  } catch (error) {
    console.error('Error in submitCompliance:', error);
    throw error;
  }
};

/**
 * Peer review: Pre-aprobar u objetar un compliance
 * @param {string} complianceId - UUID del compliance
 * @param {Object} data - Datos del review
 * @param {string} data.userId - ID del usuario que revisa
 * @param {boolean} data.approved - true = aprobar, false = objetar
 * @param {string} data.objection - Motivo de objeción (requerido si approved=false)
 * @returns {Promise<Object>} - Compliance actualizado
 */
export const peerReviewCompliance = async (complianceId, data) => {
  try {
    const response = await fetch(`${API_URL}/${complianceId}/peer-review`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al revisar el cumplimiento');
    }

    return result;
  } catch (error) {
    console.error('Error in peerReviewCompliance:', error);
    throw error;
  }
};

/**
 * Revisión del moderador: Aprobar, rechazar o ajustar
 * @param {string} complianceId - UUID del compliance
 * @param {Object} data - Datos del review
 * @param {string} data.moderatorId - ID del moderador
 * @param {string} data.decision - 'approve' | 'reject' | 'adjust'
 * @param {string} data.moderatorNotes - Notas del moderador (opcional)
 * @param {string} data.rejectionReason - Motivo de rechazo (requerido si decision='reject')
 * @param {string} data.adjustmentInstructions - Instrucciones de ajuste (requerido si decision='adjust')
 * @returns {Promise<Object>} - Compliance actualizado
 */
export const moderatorReviewCompliance = async (complianceId, data) => {
  try {
    const response = await fetch(`${API_URL}/${complianceId}/review`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al revisar el cumplimiento');
    }

    return result;
  } catch (error) {
    console.error('Error in moderatorReviewCompliance:', error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de compliances de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas detalladas
 */
export const getUserComplianceStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/stats/${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al obtener estadísticas');
    }

    return result;
  } catch (error) {
    console.error('Error in getUserComplianceStats:', error);
    throw error;
  }
};

/**
 * Obtiene el conteo de compliances pendientes de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<number>} - Número de compliances pendientes
 */
export const getPendingCompliancesCount = async (userId) => {
  try {
    const response = await getCompliances({
      userId,
      status: 'pending,requires_adjustment,overdue,warning',
      limit: 1, // Solo necesitamos el total
    });

    return response.total || 0;
  } catch (error) {
    // Fallar silenciosamente - el endpoint puede no estar disponible aún
    return 0;
  }
};

/**
 * Obtiene compliances que requieren peer review del usuario
 * @param {string} claimId - ID del reclamo
 * @returns {Promise<Object[]>} - Lista de compliances
 */
export const getCompliancesForPeerReview = async (claimId) => {
  try {
    const response = await getCompliances({
      claimId,
      status: 'submitted',
    });

    return response.data || [];
  } catch (error) {
    console.error('Error in getCompliancesForPeerReview:', error);
    throw error;
  }
};

/**
 * Obtiene compliances que requieren revisión del moderador
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>} - Lista de compliances con paginación
 */
export const getCompliancesForModeratorReview = async (filters = {}) => {
  try {
    const response = await getCompliances({
      ...filters,
      status: 'submitted,peer_approved,peer_objected,in_review',
    });

    return response;
  } catch (error) {
    console.error('Error in getCompliancesForModeratorReview:', error);
    throw error;
  }
};

/**
 * Valida si un archivo es válido para subir
 * @param {File} file - Archivo a validar
 * @returns {Object} - { valid: boolean, error?: string }
 */
export const validateFile = (file) => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'El archivo es demasiado grande (máximo 10MB)' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no permitido' };
  }

  return { valid: true };
};

/**
 * Valida múltiples archivos
 * @param {File[]} files - Archivos a validar
 * @returns {Object} - { valid: boolean, errors?: string[] }
 */
export const validateFiles = (files) => {
  const MAX_FILES = 10;

  if (files.length > MAX_FILES) {
    return { valid: false, errors: ['Máximo 10 archivos permitidos'] };
  }

  const errors = [];
  files.forEach((file, index) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      errors.push(`Archivo ${index + 1}: ${validation.error}`);
    }
  });

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
};
