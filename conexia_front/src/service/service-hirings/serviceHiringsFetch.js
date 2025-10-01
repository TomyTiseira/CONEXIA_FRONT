import { config } from '@/config';

/**
 * Obtener las contrataciones de servicios del usuario actual
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Objeto con data y pagination
 */
export async function fetchMyServiceHirings(filters = {}) {
  const { status, page = 1, limit = 10 } = filters;
  
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);

  const res = await fetch(`${config.API_URL}/service-hirings/my-requests?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener las contrataciones de servicios');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  // Retornamos la estructura completa con datos y paginación
  return {
    data: json.data.data || [],
    pagination: json.data.pagination || { page: 1, totalPages: 1, total: 0 }
  };
}

/**
 * Obtener las solicitudes de servicios para el usuario (como proveedor)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Objeto con data y pagination
 */
export async function fetchMyServiceRequests(filters = {}) {
  const { status, page = 1, limit = 10, serviceId } = filters;
  
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  if (status) params.append('status', status);
  if (serviceId) params.append('serviceId', serviceId.toString());

  const res = await fetch(`${config.API_URL}/service-hirings/my-services?${params.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener las solicitudes de servicios');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  // Retornamos la estructura completa con datos y paginación
  return {
    data: json.data.data || [],
    pagination: json.data.pagination || { page: 1, totalPages: 1, total: 0 }
  };
}

/**
 * Crear una nueva solicitud de contratación de servicio
 * @param {Object} data - { serviceId: number, title: string, description: string }
 * @returns {Promise<Object>} Respuesta de la solicitud creada
 */
export async function createServiceHiring(data) {
  const res = await fetch(`${config.API_URL}/service-hirings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al crear la solicitud de contratación');
  }

  return json;
}

/**
 * Aceptar una cotización
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function acceptQuotation(hiringId) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/accept`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json?.message || 'No se pudieron obtener las solicitudes');
  }

  const response = await res.json();
  
  if (!response.success) {
    throw new Error(response.message || 'Error en la respuesta del servidor');
  }

  // La respuesta tiene doble anidación: response.data.data para los items
  // y response.data.pagination para la paginación
  return {
    hirings: response.data.data || [],
    pagination: response.data.pagination || { page: 1, totalPages: 1, total: 0 }
  };
}

/**
 * Rechazar una cotización
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function rejectQuotation(hiringId) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/reject`, {
    method: 'POST',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al rechazar la cotización');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
  
  if (!response.success) {
    throw new Error(response.message || 'Error en la respuesta del servidor');
  }

  // Asumir la misma estructura que my-requests
  return {
    hirings: response.data.data || [],
    pagination: response.data.pagination || { page: 1, totalPages: 1, total: 0 }
  };
}

/**
 * Crear cotización para una solicitud
 * @param {number} hiringId - ID de la solicitud
 * @param {Object} data - { quotedPrice: number, estimatedHours: number, quotationNotes?: string }
 * @returns {Promise<Object>} Respuesta de la cotización creada
 */
export async function createQuotation(hiringId, data) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/quotation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    // Crear un error personalizado con información adicional para el manejo específico
    const error = new Error(json?.message || 'Error al crear la cotización');
    error.statusCode = res.status;
    error.errorType = getErrorType(json?.message);
    throw error;
  }

  if (!json.success) {
    const error = new Error(json.message || 'Error en la respuesta del servidor');
    error.statusCode = json.statusCode || 400;
    error.errorType = getErrorType(json.message);
    throw error;
  }

  return json.data;
}

/**
 * Editar cotización existente
 * @param {number} hiringId - ID de la solicitud
 * @param {Object} data - { quotedPrice: number, estimatedHours: number, quotationNotes?: string }
 * @returns {Promise<Object>} Respuesta de la cotización actualizada
 */
export async function updateQuotation(hiringId, data) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/quotation`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    // Crear un error personalizado con información adicional para el manejo específico
    const error = new Error(json?.message || 'Error al actualizar la cotización');
    error.statusCode = res.status;
    error.errorType = getErrorType(json?.message);
    throw error;
  }

  if (!json.success) {
    const error = new Error(json.message || 'Error en la respuesta del servidor');
    error.statusCode = json.statusCode || 400;
    error.errorType = getErrorType(json.message);
    throw error;
  }

  return json.data;
}

/**
 * Cancelar una contratación de servicio
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function cancelServiceHiring(hiringId) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/cancel`, {
    method: 'POST',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al cancelar la contratación');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
}

/**
 * Negociar una cotización (actualizar precio y tiempo de entrega)
 * @param {number} hiringId - ID de la contratación
 * @param {Object} data - { price: string, deliveryTime: string, description?: string }
 * @returns {Promise<Object>} Cotización actualizada
 */
export async function negotiateQuotation(hiringId, data = {}) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/negotiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al negociar la cotización');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
}

/**
 * Helper function para determinar el tipo de error basado en el mensaje
 * @param {string} message - Mensaje de error del backend
 * @returns {string} Tipo de error identificado
 */
function getErrorType(message) {
  if (!message) return 'unknown';
  
  if (message.includes('cuenta bancaria o digital activa') || 
      message.includes('cuenta de pago')) {
    return 'missing_payment_account';
  }
  
  if (message.includes('usuario solicitante fue dado de baja') || 
      message.includes('usuario solicitante fue dado de baja o baneado')) {
    return 'user_banned';
  }
  
  return 'unknown';
}