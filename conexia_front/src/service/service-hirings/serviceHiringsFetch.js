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
 * @param {Object} data - { negotiationDescription?: string }
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
 * Contratar un servicio después de aceptar cotización
 * @param {number} hiringId - ID de la contratación
 * @param {string} paymentMethod - Método de pago: 'credit_card' | 'debit_card' | 'bank_transfer'
 * @returns {Promise<Object>} Información del pago y URL de MercadoPago
 */
export async function contractService(hiringId, paymentMethod) {

  const requestBody = { paymentMethod };
  
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/contract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ [API] HTTP Error:', {
      status: res.status,
      message: json?.message || 'Sin mensaje',
      errorType: json?.errorType || 'unknown'
    });
    
    const error = new Error(json?.message || 'Error al contratar el servicio');
    error.statusCode = res.status;
    error.errorType = getContractErrorType(json?.message);
    throw error;
  }

  if (!json.success) {
    console.error('❌ [API] Business Logic Error:', {
      message: json.message || 'Sin mensaje',
      statusCode: json.statusCode || 'Sin código'
    });
    
    const error = new Error(json.message || 'Error en la respuesta del servidor');
    error.statusCode = json.statusCode || 400;
    error.errorType = getContractErrorType(json.message);
    throw error;
  }

  const responseData = {
    ...json.data,
    payment: json.data.data
  };

  return responseData;
}

/**
 * Helper function para determinar el tipo de error de contratación
 * @param {string} message - Mensaje de error del backend
 * @returns {string} Tipo de error identificado
 */
function getContractErrorType(message) {
  if (!message) return 'unknown';
  
  if (message.includes('does not have payment accounts configured') || 
      message.includes('cuentas de pago configuradas')) {
    return 'missing_payment_accounts';
  }
  
  if (message.includes('User is banned') || 
      message.includes('usuario está baneado')) {
    return 'user_banned';
  }
  
  if (message.includes('not in accepted status') || 
      message.includes('estado aceptado')) {
    return 'invalid_status';
  }
  
  if (message.includes('pago por entregables') || 
      message.includes('debe pagar cada entregable') ||
      message.includes('pay each deliverable individually')) {
    return 'payment_by_deliverables';
  }
  
  return 'unknown';
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

/**
 * Obtener modalidades de pago disponibles
 * @returns {Promise<Array>} Lista de modalidades de pago
 */
export async function fetchPaymentModalities() {
  const res = await fetch(`${config.API_URL}/service-hirings/payment-modalities`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || 'Error al obtener modalidades de pago');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
}

/**
 * Crear cotización con modalidad de pago (soporta entregables)
 * @param {number} hiringId - ID de la contratación
 * @param {Object} data - Datos de la cotización con modalidad
 * @returns {Promise<Object>} Respuesta de la cotización creada
 */
export async function createQuotationWithDeliverables(hiringId, data) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/quotation-with-deliverables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
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
 * Editar cotización con modalidad de pago (soporta entregables)
 * @param {number} hiringId - ID de la contratación
 * @param {Object} data - Datos de la cotización con modalidad
 * @returns {Promise<Object>} Respuesta de la cotización actualizada
 */
export async function updateQuotationWithDeliverables(hiringId, data) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/quotation-with-deliverables`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
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