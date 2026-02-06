import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Obtener todos los planes disponibles
 * @param {boolean} includeInactive - Si se deben incluir planes inactivos
 * @returns {Promise<Object>} - Respuesta con array de planes
 */
export async function getPlans(includeInactive = false) {
  const url = `${config.API_URL}/memberships/plans?includeInactive=${includeInactive}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    credentials: 'include',
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al obtener planes',
    };
  }
  
  return response;
}

/**
 * Obtener un plan específico por ID
 * @param {number} planId - ID del plan
 * @returns {Promise<Object>} - Respuesta con datos del plan
 */
export async function getPlanById(planId) {
  const url = `${config.API_URL}/memberships/plans/${planId}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    credentials: 'include',
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al obtener el plan',
    };
  }
  
  return response;
}

/**
 * Contratar un plan de suscripción
 * @param {number} planId - ID del plan a contratar
 * @param {string} billingCycle - 'monthly' o 'annual'
 * @param {string} cardTokenId - Token de tarjeta de MercadoPago
 * @returns {Promise<Object>} - Respuesta con URL de MercadoPago y detalles
 */
export async function contractPlan(planId, billingCycle, cardTokenId) {
  const url = `${config.API_URL}/memberships/contract-plan`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      planId,
      billingCycle,
      cardTokenId, // Token de MercadoPago para suscripciones automáticas
    }),
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al contratar el plan',
    };
  }
  
  return response;
}

/**
 * Cancelar la suscripción actual del usuario
 * @param {string|null} reason - Motivo de cancelación (opcional, máx 1000 caracteres)
 * @returns {Promise<Object>} - Respuesta con confirmación de cancelación
 */
export async function cancelSubscription(reason = null) {
  const url = `${config.API_URL}/memberships/me/subscription/cancel`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      reason: reason || null,
    }),
  });

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw {
        statusCode: res.status,
        message: `Error ${res.status}: ${res.statusText}`,
      };
    }
    
    throw {
      statusCode: res.status,
      message: errorData?.message || 'Error al cancelar la suscripción',
    };
  }

  return await res.json();
}
