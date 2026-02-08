import { config } from '@/config';

/**
 * Obtener todos los beneficios disponibles
 * @returns {Promise} Lista de beneficios
 */
export const getBenefits = async () => {
  const res = await fetch(`${config.API_URL}/memberships/benefits`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener los beneficios');
  }

  return res.json();
};

/**
 * Obtener todos los planes
 * @param {boolean} includeInactive - Incluir planes desactivados
 * @returns {Promise} Lista de planes
 */
export const getPlans = async (includeInactive = false) => {
  const params = new URLSearchParams();
  if (includeInactive) params.append('includeInactive', 'true');
  
  const url = `${config.API_URL}/memberships/plans${params.toString() ? `?${params.toString()}` : ''}`;
  
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener los planes');
  }

  return res.json();
};

/**
 * Obtener un plan específico por ID
 * @param {number} planId - ID del plan
 * @returns {Promise} Datos del plan
 */
export const getPlanById = async (planId) => {
  const res = await fetch(`${config.API_URL}/memberships/plans/${planId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al obtener el plan');
  }

  return res.json();
};

/**
 * Crear un nuevo plan
 * @param {Object} planData - Datos del plan
 * @returns {Promise} Plan creado
 */
export const createPlan = async (planData) => {
  const res = await fetch(`${config.API_URL}/memberships/plans`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear el plan');
  }

  return res.json();
};

/**
 * Actualizar un plan existente
 * @param {number} planId - ID del plan
 * @param {Object} planData - Datos actualizados
 * @returns {Promise} Plan actualizado
 */
export const updatePlan = async (planId, planData) => {
  const res = await fetch(`${config.API_URL}/memberships/plans/${planId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al actualizar el plan');
  }

  return res.json();
};

/**
 * Eliminar un plan
 * @param {number} planId - ID del plan
 * @returns {Promise} Respuesta de eliminación
 */
export const deletePlan = async (planId) => {
  const res = await fetch(`${config.API_URL}/memberships/plans/${planId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al eliminar el plan');
  }

  return res.json();
};

/**
 * Activar o desactivar un plan
 * @param {number} planId - ID del plan
 * @param {boolean} active - Estado activo/inactivo
 * @returns {Promise} Plan actualizado
 */
export const togglePlanStatus = async (planId, active) => {
  const res = await fetch(`${config.API_URL}/memberships/plans/${planId}/toggle`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ active }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al cambiar el estado del plan');
  }

  return res.json();
};
