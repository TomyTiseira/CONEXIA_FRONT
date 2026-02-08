import { config } from '@/config';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';

/**
 * Confirma una suscripción después del pago en MercadoPago
 * @param {string|number} subscriptionId - ID de la suscripción en la base de datos
 * @param {string} preapprovalId - ID del preapproval de MercadoPago (ejemplo: "2-abc123def456")
 * @returns {Promise<Object>} Respuesta del backend con la suscripción activada
 */
export async function confirmSubscription(subscriptionId, preapprovalId) {
  const url = `${config.API_URL}/memberships/subscriptions/${subscriptionId}/confirm`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ preapprovalId }),
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al confirmar la suscripción',
      error: response,
    };
  }
  
  return response;
}

/**
 * Obtiene el estado actual de una suscripción
 * @param {string|number} subscriptionId - ID de la suscripción
 * @returns {Promise<Object>} Detalles de la suscripción
 */
export async function getSubscriptionStatus(subscriptionId) {
  const url = `${config.API_URL}/memberships/subscriptions/${subscriptionId}`;
  
  const res = await fetchWithRefresh(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al obtener el estado de la suscripción',
      error: response,
    };
  }
  
  return response;
}

/**
 * Cancela una suscripción activa
 * @param {string|number} subscriptionId - ID de la suscripción
 * @returns {Promise<Object>} Confirmación de cancelación
 */
export async function cancelSubscription(subscriptionId) {
  const url = `${config.API_URL}/memberships/subscriptions/${subscriptionId}/cancel`;
  
  const res = await fetchWithRefresh(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  const response = await res.json();
  
  if (!res.ok) {
    throw {
      statusCode: res.status,
      message: response.message || 'Error al cancelar la suscripción',
      error: response,
    };
  }
  
  return response;
}
