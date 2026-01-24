/**
 * Constantes para los estados de contratación de servicios (Service Hirings)
 */

// Estados de service hirings
export const SERVICE_HIRING_STATUS = {
  // Estados normales del flujo
  PENDING: 'pending',
  QUOTED: 'quoted',
  REQUOTING: 'requoting',
  ACCEPTED: 'accepted',
  PAYMENT_PENDING: 'payment_pending',
  PAYMENT_REJECTED: 'payment_rejected',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  NEGOTIATING: 'negotiating',
  IN_PROGRESS: 'in_progress',
  IN_CLAIM: 'in_claim',
  DELIVERED: 'delivered',
  REVISION_REQUESTED: 'revision_requested',
  COMPLETED: 'completed',
  
  // Estados por reclamos
  CANCELLED_BY_CLAIM: 'cancelled_by_claim',
  COMPLETED_BY_CLAIM: 'completed_by_claim',
  COMPLETED_WITH_AGREEMENT: 'completed_with_agreement',
  
  // Estados por moderación (nuevos - cuando usuario es baneado/suspendido)
  TERMINATED_BY_MODERATION: 'terminated_by_moderation',
  FINISHED_BY_MODERATION: 'finished_by_moderation'
};

// Labels para los estados
export const SERVICE_HIRING_STATUS_LABELS = {
  [SERVICE_HIRING_STATUS.PENDING]: 'Pendiente',
  [SERVICE_HIRING_STATUS.QUOTED]: 'Cotizado',
  [SERVICE_HIRING_STATUS.REQUOTING]: 'Re-cotizando',
  [SERVICE_HIRING_STATUS.ACCEPTED]: 'Aceptado',
  [SERVICE_HIRING_STATUS.PAYMENT_PENDING]: 'Pago en proceso',
  [SERVICE_HIRING_STATUS.PAYMENT_REJECTED]: 'Pago rechazado',
  [SERVICE_HIRING_STATUS.APPROVED]: 'Aprobado',
  [SERVICE_HIRING_STATUS.REJECTED]: 'Rechazado',
  [SERVICE_HIRING_STATUS.CANCELLED]: 'Cancelado',
  [SERVICE_HIRING_STATUS.NEGOTIATING]: 'Negociando',
  [SERVICE_HIRING_STATUS.IN_PROGRESS]: 'En progreso',
  [SERVICE_HIRING_STATUS.IN_CLAIM]: 'En reclamo',
  [SERVICE_HIRING_STATUS.DELIVERED]: 'Entregado',
  [SERVICE_HIRING_STATUS.REVISION_REQUESTED]: 'Revisión solicitada',
  [SERVICE_HIRING_STATUS.COMPLETED]: 'Completado',
  [SERVICE_HIRING_STATUS.CANCELLED_BY_CLAIM]: 'Cancelado por reclamo',
  [SERVICE_HIRING_STATUS.COMPLETED_BY_CLAIM]: 'Finalizado por reclamo',
  [SERVICE_HIRING_STATUS.COMPLETED_WITH_AGREEMENT]: 'Finalizado con acuerdo',
  [SERVICE_HIRING_STATUS.TERMINATED_BY_MODERATION]: 'Terminado por moderación',
  [SERVICE_HIRING_STATUS.FINISHED_BY_MODERATION]: 'Finalizado por moderación'
};

// Clases de estilo para los badges de estado
export const SERVICE_HIRING_STATUS_STYLES = {
  [SERVICE_HIRING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [SERVICE_HIRING_STATUS.QUOTED]: 'bg-blue-100 text-blue-800',
  [SERVICE_HIRING_STATUS.REQUOTING]: 'bg-sky-100 text-sky-800',
  [SERVICE_HIRING_STATUS.ACCEPTED]: 'bg-green-100 text-green-800',
  [SERVICE_HIRING_STATUS.PAYMENT_PENDING]: 'bg-amber-100 text-amber-800',
  [SERVICE_HIRING_STATUS.PAYMENT_REJECTED]: 'bg-rose-100 text-rose-800',
  [SERVICE_HIRING_STATUS.APPROVED]: 'bg-conexia-green/10 text-conexia-green',
  [SERVICE_HIRING_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [SERVICE_HIRING_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
  [SERVICE_HIRING_STATUS.NEGOTIATING]: 'bg-orange-100 text-orange-800',
  [SERVICE_HIRING_STATUS.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [SERVICE_HIRING_STATUS.IN_CLAIM]: 'bg-red-100 text-red-800',
  [SERVICE_HIRING_STATUS.DELIVERED]: 'bg-teal-100 text-teal-800',
  [SERVICE_HIRING_STATUS.REVISION_REQUESTED]: 'bg-orange-100 text-orange-800',
  [SERVICE_HIRING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [SERVICE_HIRING_STATUS.CANCELLED_BY_CLAIM]: 'bg-red-100 text-red-800',
  [SERVICE_HIRING_STATUS.COMPLETED_BY_CLAIM]: 'bg-purple-100 text-purple-800',
  [SERVICE_HIRING_STATUS.COMPLETED_WITH_AGREEMENT]: 'bg-teal-100 text-teal-800',
  [SERVICE_HIRING_STATUS.TERMINATED_BY_MODERATION]: 'bg-slate-100 text-slate-800',
  [SERVICE_HIRING_STATUS.FINISHED_BY_MODERATION]: 'bg-slate-100 text-slate-800'
};

// Opciones para los filtros de estado
export const SERVICE_HIRING_STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: SERVICE_HIRING_STATUS.PENDING, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.PENDING] },
  { value: SERVICE_HIRING_STATUS.QUOTED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.QUOTED] },
  { value: SERVICE_HIRING_STATUS.REQUOTING, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.REQUOTING] },
  { value: SERVICE_HIRING_STATUS.ACCEPTED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.ACCEPTED] },
  { value: SERVICE_HIRING_STATUS.APPROVED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.APPROVED] },
  { value: SERVICE_HIRING_STATUS.REJECTED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.REJECTED] },
  { value: SERVICE_HIRING_STATUS.CANCELLED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.CANCELLED] },
  { value: SERVICE_HIRING_STATUS.NEGOTIATING, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.NEGOTIATING] },
  { value: SERVICE_HIRING_STATUS.IN_PROGRESS, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.IN_PROGRESS] },
  { value: SERVICE_HIRING_STATUS.IN_CLAIM, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.IN_CLAIM] },
  { value: SERVICE_HIRING_STATUS.DELIVERED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.DELIVERED] },
  { value: SERVICE_HIRING_STATUS.REVISION_REQUESTED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.REVISION_REQUESTED] },
  { value: SERVICE_HIRING_STATUS.COMPLETED, label: SERVICE_HIRING_STATUS_LABELS[SERVICE_HIRING_STATUS.COMPLETED] }
];

// Estados que NO permiten acciones del usuario (solo lectura)
export const READ_ONLY_STATES = [
  SERVICE_HIRING_STATUS.REJECTED,
  SERVICE_HIRING_STATUS.CANCELLED,
  SERVICE_HIRING_STATUS.COMPLETED,
  SERVICE_HIRING_STATUS.CANCELLED_BY_CLAIM,
  SERVICE_HIRING_STATUS.COMPLETED_BY_CLAIM,
  SERVICE_HIRING_STATUS.COMPLETED_WITH_AGREEMENT,
  SERVICE_HIRING_STATUS.TERMINATED_BY_MODERATION,
  SERVICE_HIRING_STATUS.FINISHED_BY_MODERATION
];

/**
 * Verifica si un hiring está en un estado de solo lectura (no permite acciones)
 * @param {string} statusCode - Código de estado del hiring
 * @returns {boolean}
 */
export const isReadOnlyState = (statusCode) => {
  return READ_ONLY_STATES.includes(statusCode);
};

/**
 * Obtiene el badge de estado para un hiring
 * @param {string} statusCode - Código de estado del hiring
 * @returns {Object} { label, className }
 */
export const getServiceHiringStatusBadge = (statusCode) => {
  const label = SERVICE_HIRING_STATUS_LABELS[statusCode] || statusCode;
  const className = SERVICE_HIRING_STATUS_STYLES[statusCode] || 'bg-gray-100 text-gray-800';
  
  return { label, className };
};

/**
 * Verifica si un hiring fue terminado por moderación
 * @param {string} statusCode - Código de estado del hiring
 * @returns {boolean}
 */
export const isTerminatedByModeration = (statusCode) => {
  return [
    SERVICE_HIRING_STATUS.TERMINATED_BY_MODERATION,
    SERVICE_HIRING_STATUS.FINISHED_BY_MODERATION
  ].includes(statusCode);
};

// ========================================
// CONSTANTES PARA SERVICIOS Y PROYECTOS MODERADOS
// ========================================

/**
 * Estados de servicios
 */
export const SERVICE_STATUS = {
  ACTIVE: 'active',
  FINISHED_BY_MODERATION: 'finished_by_moderation',
  DELETED: 'deleted'
};

/**
 * Verifica si un servicio está moderado
 * @param {Object} service - Objeto del servicio
 * @returns {boolean}
 */
export const isServiceModerated = (service) => {
  return service?.status === SERVICE_STATUS.FINISHED_BY_MODERATION;
};

/**
 * Verifica si un proyecto está moderado
 * @param {Object} project - Objeto del proyecto
 * @returns {boolean}
 */
export const isProjectModerated = (project) => {
  return project?.suspendedByModeration === true;
};
