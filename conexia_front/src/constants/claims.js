/**
 * Claims Constants
 * Tipos de reclamos, estados y configuraciones
 */

// Estados de reclamos
export const CLAIM_STATUS = {
  OPEN: 'open',  // Abierto, esperando observaciones
  IN_REVIEW: 'in_review',  // Moderador revisando
  PENDING_CLARIFICATION: 'pending_clarification',  // Requiere aclaración del reclamante
  REQUIRES_STAFF_RESPONSE: 'requires_staff_response',  // Requiere acción del staff (luego de subsanación)
  CANCELLED: 'cancelled',  // Cancelado por el denunciante

  // Legacy/compat
  REQUIRES_RESPONSE: 'requires_response',  // Requiere respuesta del reclamado (legacy)
  PENDING_COMPLIANCE: 'pending_compliance',  // Cumplimiento pendiente
  REVIEWING_COMPLIANCE: 'reviewing_compliance',  // Revisando cumplimiento
  RESOLVED: 'resolved',  // Resuelto completamente
  REJECTED: 'rejected',  // Rechazado
  FINISHED_BY_MODERATION: 'finished_by_moderation',  // Finalizado por moderación
};

// Tipos de reclamos para clientes
export const CLIENT_CLAIM_TYPES = {
  NOT_DELIVERED: 'not_delivered',
  OFF_AGREEMENT: 'off_agreement',
  DEFECTIVE_DELIVERY: 'defective_delivery',
  CLIENT_OTHER: 'client_other',
};

// Tipos de reclamos para proveedores
export const PROVIDER_CLAIM_TYPES = {
  PAYMENT_NOT_RECEIVED: 'payment_not_received',
  PROVIDER_OTHER: 'provider_other',
};

// Labels para tipos de reclamos (cliente)
export const CLIENT_CLAIM_TYPE_LABELS = {
  [CLIENT_CLAIM_TYPES.NOT_DELIVERED]: 'No se entregó el trabajo',
  [CLIENT_CLAIM_TYPES.OFF_AGREEMENT]: 'Entrega fuera de lo acordado',
  [CLIENT_CLAIM_TYPES.DEFECTIVE_DELIVERY]: 'Entrega defectuosa',
  [CLIENT_CLAIM_TYPES.CLIENT_OTHER]: 'Otro',
};

// Labels para tipos de reclamos (proveedor)
export const PROVIDER_CLAIM_TYPE_LABELS = {
  [PROVIDER_CLAIM_TYPES.PAYMENT_NOT_RECEIVED]: 'No se recibió el pago',
  [PROVIDER_CLAIM_TYPES.PROVIDER_OTHER]: 'Otro',
};

// Labels para estados
export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.OPEN]: 'Abierto',
  [CLAIM_STATUS.IN_REVIEW]: 'En Revisión',
  [CLAIM_STATUS.PENDING_CLARIFICATION]: 'Requiere aclaración',
  [CLAIM_STATUS.REQUIRES_STAFF_RESPONSE]: 'Requiere respuesta',
  [CLAIM_STATUS.CANCELLED]: 'Cancelado',
  [CLAIM_STATUS.REQUIRES_RESPONSE]: 'Requiere Respuesta',
  [CLAIM_STATUS.PENDING_COMPLIANCE]: 'Cumplimiento Pendiente',
  [CLAIM_STATUS.REVIEWING_COMPLIANCE]: 'Revisando Cumplimiento',
  [CLAIM_STATUS.RESOLVED]: 'Resuelto',
  [CLAIM_STATUS.REJECTED]: 'Rechazado',
  [CLAIM_STATUS.FINISHED_BY_MODERATION]: 'Finalizado por moderación',
};

// Configuración de colores para badges
export const CLAIM_STATUS_CONFIG = {
  [CLAIM_STATUS.OPEN]: {
    variant: 'warning',
    label: 'Abierto',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [CLAIM_STATUS.IN_REVIEW]: {
    variant: 'info',
    label: 'En Revisión',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    className: 'bg-blue-100 text-blue-800',
  },
  [CLAIM_STATUS.PENDING_CLARIFICATION]: {
    variant: 'warning',
    label: 'Requiere aclaración',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    className: 'bg-orange-100 text-orange-800',
  },
  [CLAIM_STATUS.REQUIRES_STAFF_RESPONSE]: {
    variant: 'info',
    label: 'Requiere respuesta',
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    className: 'bg-indigo-100 text-indigo-800',
  },
  [CLAIM_STATUS.CANCELLED]: {
    variant: 'danger',
    label: 'Cancelado',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    className: 'bg-gray-100 text-gray-800',
  },
  [CLAIM_STATUS.REQUIRES_RESPONSE]: {
    variant: 'warning',
    label: 'Requiere Respuesta',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    className: 'bg-amber-100 text-amber-800',
  },
  [CLAIM_STATUS.PENDING_COMPLIANCE]: {
    variant: 'warning',
    label: 'Cumplimiento Pendiente',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    className: 'bg-purple-100 text-purple-800',
  },
  [CLAIM_STATUS.REVIEWING_COMPLIANCE]: {
    variant: 'info',
    label: 'Revisando Cumplimiento',
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    className: 'bg-indigo-100 text-indigo-800',
  },
  [CLAIM_STATUS.RESOLVED]: {
    variant: 'success',
    label: 'Resuelto',
    color: 'text-green-700',
    bg: 'bg-green-100',
    className: 'bg-green-100 text-green-800',
  },
  [CLAIM_STATUS.REJECTED]: {
    variant: 'danger',
    label: 'Rechazado',
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    className: 'bg-gray-100 text-gray-800',
  },
  [CLAIM_STATUS.FINISHED_BY_MODERATION]: {
    variant: 'info',
    label: 'Finalizado por moderación',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    className: 'bg-slate-100 text-slate-800',
  },
};

// Estados de hiring que permiten crear reclamos
export const ALLOWED_CLAIM_STATES = [
  'in_progress',
  'approved',
  'revision_requested',
  'delivered',
];

// Tipos de resolución
export const CLAIM_RESOLUTION_TYPES = {
  CLIENT_FAVOR: 'client_favor',
  PROVIDER_FAVOR: 'provider_favor',
  PARTIAL_AGREEMENT: 'partial_agreement',
};

// Labels y descripciones para tipos de resolución
export const CLAIM_RESOLUTION_CONFIG = {
  [CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR]: {
    label: 'A favor del cliente',
    description: 'La contratación se cancelará y el cliente no realizará el pago',
    hiringStatusLabel: 'Cancelado por reclamo',
  },
  [CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR]: {
    label: 'A favor del proveedor',
    description: 'La contratación se marcará como finalizada y el proveedor recibirá el pago completo',
    hiringStatusLabel: 'Finalizado por reclamo',
  },
  [CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT]: {
    label: 'Acuerdo parcial',
    description: 'Ambas partes llegaron a un acuerdo. Puede incluir pago parcial u otros términos',
    hiringStatusLabel: 'Finalizado con acuerdo',
  },
};

// Tipos de compliance (compromisos)
export const COMPLIANCE_TYPES = {
  // === COMPROMISOS MONETARIOS ===
  FULL_REFUND: 'full_refund',
  PARTIAL_REFUND: 'partial_refund',
  PAYMENT_REQUIRED: 'payment_required',
  PARTIAL_PAYMENT: 'partial_payment',
  
  // === COMPROMISOS DE TRABAJO ===
  WORK_COMPLETION: 'work_completion',
  WORK_REVISION: 'work_revision',
  FULL_REDELIVERY: 'full_redelivery',
  CORRECTED_DELIVERY: 'corrected_delivery',
  ADDITIONAL_DELIVERY: 'additional_delivery',
  
  // === DOCUMENTACIÓN ===
  EVIDENCE_UPLOAD: 'evidence_upload',
  
  // === FINALIZACIÓN ===
  CONFIRMATION_ONLY: 'confirmation_only',
  OTHER: 'other',
};

// Labels para tipos de compliance
export const COMPLIANCE_TYPE_LABELS = {
  // Compromisos monetarios
  [COMPLIANCE_TYPES.FULL_REFUND]: 'Reembolso total',
  [COMPLIANCE_TYPES.PARTIAL_REFUND]: 'Reembolso parcial',
  [COMPLIANCE_TYPES.PAYMENT_REQUIRED]: 'Pago requerido',
  [COMPLIANCE_TYPES.PARTIAL_PAYMENT]: 'Pago parcial',
  
  // Compromisos de trabajo
  [COMPLIANCE_TYPES.WORK_COMPLETION]: 'Completar trabajo',
  [COMPLIANCE_TYPES.WORK_REVISION]: 'Revisión de trabajo',
  [COMPLIANCE_TYPES.FULL_REDELIVERY]: 'Reentrega completa',
  [COMPLIANCE_TYPES.CORRECTED_DELIVERY]: 'Entrega corregida',
  [COMPLIANCE_TYPES.ADDITIONAL_DELIVERY]: 'Entrega adicional',
  
  // Documentación
  [COMPLIANCE_TYPES.EVIDENCE_UPLOAD]: 'Subir evidencia',
  
  // Finalización
  [COMPLIANCE_TYPES.CONFIRMATION_ONLY]: 'Solo confirmación',
  [COMPLIANCE_TYPES.OTHER]: 'Otro',
};

// Estados de compliance
export const COMPLIANCE_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  PEER_APPROVED: 'peer_approved',
  PEER_OBJECTED: 'peer_objected',
  IN_REVIEW: 'in_review',
  REQUIRES_ADJUSTMENT: 'requires_adjustment',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  OVERDUE: 'overdue',
  WARNING: 'warning',
  ESCALATED: 'escalated',
  FINISHED_BY_MODERATION: 'finished_by_moderation',
};

// Labels para estados de compliance
export const COMPLIANCE_STATUS_LABELS = {
  [COMPLIANCE_STATUS.PENDING]: 'Pendiente',
  [COMPLIANCE_STATUS.SUBMITTED]: 'Enviado',
  [COMPLIANCE_STATUS.PEER_APPROVED]: 'Preaprobado',
  [COMPLIANCE_STATUS.PEER_OBJECTED]: 'Prerechazado',
  [COMPLIANCE_STATUS.IN_REVIEW]: 'En revisión',
  [COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT]: 'Requiere ajustes',
  [COMPLIANCE_STATUS.APPROVED]: 'Aprobado',
  [COMPLIANCE_STATUS.REJECTED]: 'Rechazado',
  [COMPLIANCE_STATUS.OVERDUE]: 'Vencido',
  [COMPLIANCE_STATUS.WARNING]: 'Advertencia',
  [COMPLIANCE_STATUS.ESCALATED]: 'Escalado',
  [COMPLIANCE_STATUS.FINISHED_BY_MODERATION]: 'Finalizado por moderación',
};

// Configuración de colores para estados de compliance
export const COMPLIANCE_STATUS_CONFIG = {
  [COMPLIANCE_STATUS.PENDING]: {
    label: 'Pendiente',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  [COMPLIANCE_STATUS.SUBMITTED]: {
    label: 'Enviado',
    className: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  [COMPLIANCE_STATUS.PEER_APPROVED]: {
    label: 'Preaprobado',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  [COMPLIANCE_STATUS.PEER_OBJECTED]: {
    label: 'Prerechazado',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  [COMPLIANCE_STATUS.IN_REVIEW]: {
    label: 'En revisión',
    className: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  [COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT]: {
    label: 'Requiere ajustes',
    className: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  [COMPLIANCE_STATUS.APPROVED]: {
    label: 'Aprobado',
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  [COMPLIANCE_STATUS.REJECTED]: {
    label: 'Rechazado',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  [COMPLIANCE_STATUS.OVERDUE]: {
    label: 'Vencido',
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  [COMPLIANCE_STATUS.WARNING]: {
    label: '2do Vencimiento',
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  [COMPLIANCE_STATUS.ESCALATED]: {
    label: '3er Vencimiento',
    className: 'bg-red-100 text-red-900 border-red-400',
  },
  [COMPLIANCE_STATUS.FINISHED_BY_MODERATION]: {
    label: 'Finalizado por moderación',
    className: 'bg-slate-100 text-slate-800 border-slate-300',
  },
};

// Validaciones para compliances
export const COMPLIANCE_VALIDATION = {
  MAX_EVIDENCE_FILES: 5,
  INSTRUCTIONS_MIN_LENGTH: 20,
  INSTRUCTIONS_MAX_LENGTH: 1000,
  USER_NOTES_MIN_LENGTH: 20,
  USER_NOTES_MAX_LENGTH: 1000,
  MIN_DEADLINE_DAYS: 1,
  MAX_DEADLINE_DAYS: 60,
};

// Validaciones
export const CLAIM_VALIDATION = {
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 2000,
  OBSERVATIONS_MIN_LENGTH: 20,
  OBSERVATIONS_MAX_LENGTH: 2000,
  RESOLUTION_MIN_LENGTH: 20,
  RESOLUTION_MAX_LENGTH: 2000,
  PARTIAL_AGREEMENT_MAX_LENGTH: 500,
  MAX_EVIDENCE_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  ALLOWED_FILE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'pdf', 'docx'],
};

// Mensajes de error
export const CLAIM_ERROR_MESSAGES = {
  CLAIM_TYPE_REQUIRED: 'Por favor selecciona el motivo del reclamo',
  DESCRIPTION_REQUIRED: 'La descripción es requerida',
  DESCRIPTION_MIN_LENGTH: `La descripción debe tener al menos ${CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH} caracteres`,
  DESCRIPTION_MAX_LENGTH: `La descripción no puede exceder ${CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres`,
  RESOLUTION_MIN_LENGTH: `La resolución debe tener al menos ${CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH} caracteres`,
  RESOLUTION_MAX_LENGTH: `La resolución no puede exceder ${CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH} caracteres`,
  MAX_FILES: `No puedes subir más de ${CLAIM_VALIDATION.MAX_EVIDENCE_FILES} archivos`,
  MAX_SIZE: 'Cada archivo debe pesar máximo 10 MB',
  INVALID_FORMAT: 'Formato no permitido. Solo JPG, PNG, PDF, DOCX',
  ALREADY_EXISTS: 'Ya existe un reclamo activo para este servicio',
  UPLOAD_ERROR: 'Error al subir archivo. Intenta nuevamente',
};

// Roles en el reclamo
export const CLAIM_ROLES = {
  CLAIMANT: 'claimant',  // Reclamante
  RESPONDENT: 'respondent',  // Reclamado
};

// Labels para roles
export const CLAIM_ROLE_LABELS = {
  [CLAIM_ROLES.CLAIMANT]: 'Reclamante',
  [CLAIM_ROLES.RESPONDENT]: 'Reclamado',
};

// Configuración de badges de rol
export const CLAIM_ROLE_CONFIG = {
  [CLAIM_ROLES.CLAIMANT]: {
    label: 'Reclamante',
    className: 'bg-green-100 text-green-700',  // Verde positivo para reclamante
  },
  [CLAIM_ROLES.RESPONDENT]: {
    label: 'Reclamado',
    className: 'bg-red-100 text-red-700',  // Rojo negativo para reclamado
  },
};

// Prioridades de reclamo
export const CLAIM_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Labels para prioridades
export const CLAIM_PRIORITY_LABELS = {
  [CLAIM_PRIORITY.LOW]: 'Baja',
  [CLAIM_PRIORITY.MEDIUM]: 'Media',
  [CLAIM_PRIORITY.HIGH]: 'Alta',
  [CLAIM_PRIORITY.URGENT]: 'Urgente',
};

// Configuración de badges de prioridad
export const CLAIM_PRIORITY_CONFIG = {
  [CLAIM_PRIORITY.LOW]: {
    label: 'Baja',
    className: 'bg-gray-100 text-gray-800',
  },
  [CLAIM_PRIORITY.MEDIUM]: {
    label: 'Media',
    className: 'bg-yellow-100 text-yellow-800',
  },
  [CLAIM_PRIORITY.HIGH]: {
    label: 'Alta',
    className: 'bg-orange-100 text-orange-800',
  },
  [CLAIM_PRIORITY.URGENT]: {
    label: 'Urgente',
    className: 'bg-red-100 text-red-800',
  },
};

// Helper para obtener badge de estado
export const getClaimStatusBadge = (status) => {
  const safeStatus = status || CLAIM_STATUS.OPEN;
  const config = CLAIM_STATUS_CONFIG[safeStatus] || CLAIM_STATUS_CONFIG[CLAIM_STATUS.OPEN];

  // Fallback defensivo: evita crashear si el backend envía un estado nuevo/no contemplado.
  if (!config) {
    return {
      label: CLAIM_STATUS_LABELS[safeStatus] || 'Desconocido',
      className: 'bg-gray-100 text-gray-800',
    };
  }

  return {
    label: config.label || CLAIM_STATUS_LABELS[safeStatus] || 'Desconocido',
    className: config.className || 'bg-gray-100 text-gray-800',
  };
};

// Helper para obtener badge de rol
export const getClaimRoleBadge = (role) => {
  const config = CLAIM_ROLE_CONFIG[role] || CLAIM_ROLE_CONFIG[CLAIM_ROLES.CLAIMANT];
  return {
    label: config.label,
    className: config.className,
  };
};

// Helper para obtener badge de prioridad
export const getClaimPriorityBadge = (priority) => {
  const config = CLAIM_PRIORITY_CONFIG[priority] || CLAIM_PRIORITY_CONFIG[CLAIM_PRIORITY.MEDIUM];
  return {
    label: config.label,
    className: config.className,
  };
};

// Helper para formatear fecha
export const formatClaimDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Helper para formatear fecha y hora
export const formatClaimDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Helper para validar archivo
export const isValidClaimFile = (file) => {
  const isValidType = CLAIM_VALIDATION.ALLOWED_FILE_TYPES.includes(file.type);
  const isValidSize = file.size <= CLAIM_VALIDATION.MAX_FILE_SIZE;
  return isValidType && isValidSize;
};

// Helper para obtener días desde creación
export const getDaysSinceCreation = (createdAt) => {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper para obtener label del tipo de reclamo
export const getClaimTypeLabel = (claimType) => {
  // Intentar primero en tipos de cliente
  if (CLIENT_CLAIM_TYPE_LABELS[claimType]) {
    return CLIENT_CLAIM_TYPE_LABELS[claimType];
  }
  // Si no, intentar en tipos de proveedor
  if (PROVIDER_CLAIM_TYPE_LABELS[claimType]) {
    return PROVIDER_CLAIM_TYPE_LABELS[claimType];
  }
  // Si no existe, retornar el código formateado
  return claimType ? claimType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') : 'N/A';
};

const claimsConstants = {
  CLAIM_STATUS,
  CLIENT_CLAIM_TYPES,
  PROVIDER_CLAIM_TYPES,
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_CONFIG,
  CLAIM_RESOLUTION_TYPES,
  CLAIM_RESOLUTION_CONFIG,
  COMPLIANCE_TYPES,
  COMPLIANCE_TYPE_LABELS,
  COMPLIANCE_STATUS,
  COMPLIANCE_STATUS_LABELS,
  COMPLIANCE_STATUS_CONFIG,
  COMPLIANCE_VALIDATION,
  ALLOWED_CLAIM_STATES,
  CLAIM_VALIDATION,
  CLAIM_ERROR_MESSAGES,
  CLAIM_ROLES,
  CLAIM_ROLE_LABELS,
  CLAIM_ROLE_CONFIG,
  CLAIM_PRIORITY,
  CLAIM_PRIORITY_LABELS,
  CLAIM_PRIORITY_CONFIG,
  getClaimStatusBadge,
  getClaimRoleBadge,
  getClaimPriorityBadge,
  getClaimTypeLabel,
  formatClaimDate,
  formatClaimDateTime,
  isValidClaimFile,
  getDaysSinceCreation,
};

export default claimsConstants;
