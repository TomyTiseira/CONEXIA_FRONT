import { config } from '@/config';

/**
 * Crear una entrega para un servicio contratado
 * @param {number} hiringId - ID de la contratación
 * @param {FormData} formData - Datos del formulario con content, deliverableId (opcional), attachment (opcional)
 * @returns {Promise<Object>} Delivery creado
 */
export async function createDelivery(hiringId, formData) {
  // Log para debugging
  console.log('📤 [API] Creando entrega con:', {
    hiringId,
    content: formData.get('content'),
    deliverableId: formData.get('deliverableId'),
    hasAttachment: !!formData.get('attachment')
  });

  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/delivery`, {
    method: 'POST',
    credentials: 'include',
    body: formData, // FormData ya incluye el Content-Type correcto
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ [API] Error al crear entrega:', {
      status: res.status,
      message: json?.message || 'Sin mensaje',
      details: json
    });
    
    const error = new Error(json?.message || 'Error al crear la entrega');
    error.statusCode = res.status;
    throw error;
  }

  if (!json.success) {
    console.error('❌ [API] Error en respuesta:', json.message || 'Sin mensaje');
    
    const error = new Error(json.message || 'Error en la respuesta del servidor');
    error.statusCode = json.statusCode || 400;
    throw error;
  }

  return json.data;
}

/**
 * Obtener todas las entregas de un servicio contratado
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object>} { deliveries: Array, total: number }
 */
export async function fetchDeliveries(hiringId) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}/deliveries`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ [API] Error al obtener entregas:', {
      status: res.status,
      message: json?.message || 'Sin mensaje'
    });
    
    throw new Error(json?.message || 'Error al obtener las entregas');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
}

/**
 * Revisar una entrega (aprobar o solicitar revisión)
 * @param {number} deliveryId - ID de la entrega
 * @param {Object} data - { action: 'approve' | 'request_revision', notes?: string }
 * @returns {Promise<Object>} Delivery actualizado
 */
export async function reviewDelivery(deliveryId, data) {
  const res = await fetch(`${config.API_URL}/service-hirings/deliveries/${deliveryId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ [API] Error al revisar entrega:', {
      status: res.status,
      message: json?.message || 'Sin mensaje'
    });
    
    const error = new Error(json?.message || 'Error al revisar la entrega');
    error.statusCode = res.status;
    throw error;
  }

  if (!json.success) {
    console.error('❌ [API] Error en respuesta:', json.message || 'Sin mensaje');
    
    const error = new Error(json.message || 'Error en la respuesta del servidor');
    error.statusCode = json.statusCode || 400;
    throw error;
  }

  return json.data;
}

/**
 * Obtener detalle de un hiring con sus entregas
 * @param {number} hiringId - ID de la contratación
 * @returns {Promise<Object>} Hiring completo con deliverables y deliveries
 */
export async function fetchHiringWithDeliveries(hiringId) {
  const res = await fetch(`${config.API_URL}/service-hirings/${hiringId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const json = await res.json();

  if (!res.ok) {
    console.error('❌ [API] Error al obtener contratación:', {
      status: res.status,
      message: json?.message || 'Sin mensaje'
    });
    
    throw new Error(json?.message || 'Error al obtener la contratación');
  }

  if (!json.success) {
    throw new Error(json.message || 'Error en la respuesta del servidor');
  }

  return json.data;
}
