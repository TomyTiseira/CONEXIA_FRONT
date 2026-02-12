/**
 * Compliances Constants
 * Tipos de cumplimientos, estados y configuraciones
 */

// ============ TIPOS DE COMPLIANCE ============
export const COMPLIANCE_TYPE = {
  FULL_REFUND: 'full_refund',
  PARTIAL_REFUND: 'partial_refund',
  FULL_REDELIVERY: 'full_redelivery',
  CORRECTED_DELIVERY: 'corrected_delivery',
  ADDITIONAL_DELIVERY: 'additional_delivery',
  PAYMENT_REQUIRED: 'payment_required',
  PARTIAL_PAYMENT: 'partial_payment',
  EVIDENCE_UPLOAD: 'evidence_upload',
  CONFIRMATION_ONLY: 'confirmation_only',
  AUTO_REFUND: 'auto_refund',
  NO_ACTION_REQUIRED: 'no_action_required',
};

// Labels para tipos de compliance
export const COMPLIANCE_TYPE_LABELS = {
  [COMPLIANCE_TYPE.FULL_REFUND]: 'Reembolso Total',
  [COMPLIANCE_TYPE.PARTIAL_REFUND]: 'Reembolso Parcial',
  [COMPLIANCE_TYPE.FULL_REDELIVERY]: 'Reentrega Completa',
  [COMPLIANCE_TYPE.CORRECTED_DELIVERY]: 'Entrega Corregida',
  [COMPLIANCE_TYPE.ADDITIONAL_DELIVERY]: 'Entrega Adicional',
  [COMPLIANCE_TYPE.PAYMENT_REQUIRED]: 'Pago Requerido',
  [COMPLIANCE_TYPE.PARTIAL_PAYMENT]: 'Pago Parcial',
  [COMPLIANCE_TYPE.EVIDENCE_UPLOAD]: 'Subir Evidencia',
  [COMPLIANCE_TYPE.CONFIRMATION_ONLY]: 'Solo Confirmación',
  [COMPLIANCE_TYPE.AUTO_REFUND]: 'Reembolso Automático',
  [COMPLIANCE_TYPE.NO_ACTION_REQUIRED]: 'Sin Acción Requerida',
};

// Iconos para tipos de compliance
export const COMPLIANCE_TYPE_ICONS = {
  [COMPLIANCE_TYPE.FULL_REFUND]: '💰',
  [COMPLIANCE_TYPE.PARTIAL_REFUND]: '💵',
  [COMPLIANCE_TYPE.FULL_REDELIVERY]: '🔄',
  [COMPLIANCE_TYPE.CORRECTED_DELIVERY]: '✏️',
  [COMPLIANCE_TYPE.ADDITIONAL_DELIVERY]: '📎',
  [COMPLIANCE_TYPE.PAYMENT_REQUIRED]: '💳',
  [COMPLIANCE_TYPE.PARTIAL_PAYMENT]: '💳',
  [COMPLIANCE_TYPE.EVIDENCE_UPLOAD]: '📄',
  [COMPLIANCE_TYPE.CONFIRMATION_ONLY]: '✅',
  [COMPLIANCE_TYPE.AUTO_REFUND]: '🤖',
  [COMPLIANCE_TYPE.NO_ACTION_REQUIRED]: '🆗',
};

// ============ ESTADOS DE COMPLIANCE ============
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
};

// Labels para estados
export const COMPLIANCE_STATUS_LABELS = {
  [COMPLIANCE_STATUS.PENDING]: 'Pendiente',
  [COMPLIANCE_STATUS.SUBMITTED]: 'Enviado',
  [COMPLIANCE_STATUS.PEER_APPROVED]: 'Pre-aprobado',
  [COMPLIANCE_STATUS.PEER_OBJECTED]: 'Objetado',
  [COMPLIANCE_STATUS.IN_REVIEW]: 'En revisión',
  [COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT]: 'Requiere ajuste',
  [COMPLIANCE_STATUS.APPROVED]: 'Aprobado',
  [COMPLIANCE_STATUS.REJECTED]: 'Rechazado',
  [COMPLIANCE_STATUS.OVERDUE]: 'Vencido',
  [COMPLIANCE_STATUS.WARNING]: 'Advertencia',
  [COMPLIANCE_STATUS.ESCALATED]: 'Escalado',
};

// Configuración de colores para badges de estado
export const COMPLIANCE_STATUS_CONFIG = {
  [COMPLIANCE_STATUS.PENDING]: {
    label: 'Pendiente',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    border: 'border-yellow-300',
  },
  [COMPLIANCE_STATUS.SUBMITTED]: {
    label: 'Enviado',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
  },
  [COMPLIANCE_STATUS.PEER_APPROVED]: {
    label: 'Pre-aprobado',
    color: 'text-teal-700',
    bg: 'bg-teal-100',
    border: 'border-teal-300',
  },
  [COMPLIANCE_STATUS.PEER_OBJECTED]: {
    label: 'Objetado',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-300',
  },
  [COMPLIANCE_STATUS.IN_REVIEW]: {
    label: 'En revisión',
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
  },
  [COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT]: {
    label: 'Requiere ajuste',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
  },
  [COMPLIANCE_STATUS.APPROVED]: {
    label: 'Aprobado',
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
  },
  [COMPLIANCE_STATUS.REJECTED]: {
    label: 'Rechazado',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
  },
  [COMPLIANCE_STATUS.OVERDUE]: {
    label: 'Vencido',
    color: 'text-red-800',
    bg: 'bg-red-200',
    border: 'border-red-400',
  },
  [COMPLIANCE_STATUS.WARNING]: {
    label: 'Advertencia crítica',
    color: 'text-red-900',
    bg: 'bg-red-300',
    border: 'border-red-500',
  },
  [COMPLIANCE_STATUS.ESCALATED]: {
    label: 'Escalado',
    color: 'text-gray-800',
    bg: 'bg-gray-300',
    border: 'border-gray-500',
  },
};

// ============ NIVELES DE URGENCIA ============
export const URGENCY_LEVEL = {
  NORMAL: 'normal',
  WARNING: 'warning',
  URGENT: 'urgent',
  CRITICAL: 'critical',
};

// Configuración de niveles de urgencia
export const URGENCY_CONFIG = {
  [URGENCY_LEVEL.NORMAL]: {
    label: 'Normal',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: '🟢',
  },
  [URGENCY_LEVEL.WARNING]: {
    label: 'Atención',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    icon: '🟡',
  },
  [URGENCY_LEVEL.URGENT]: {
    label: 'Urgente',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    icon: '🟠',
  },
  [URGENCY_LEVEL.CRITICAL]: {
    label: 'Crítico',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-500',
    icon: '🔴',
  },
};

// ============ TIPOS DE REQUERIMIENTO ============
export const COMPLIANCE_REQUIREMENT = {
  SEQUENTIAL: 'sequential',
  PARALLEL: 'parallel',
};

// ============ VALIDACIONES ============
export const COMPLIANCE_VALIDATION = {
  MAX_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  MIN_NOTES_LENGTH: 10,
  MAX_NOTES_LENGTH: 1000,
  MIN_OBJECTION_LENGTH: 20,
  MAX_OBJECTION_LENGTH: 500,
};

// ============ MENSAJES DE ERROR ============
export const COMPLIANCE_ERROR_MESSAGES = {
  COMPLIANCE_NOT_FOUND: 'No se encontró el cumplimiento',
  NOT_RESPONSIBLE: 'No eres el responsable de este cumplimiento',
  INVALID_STATUS: 'No puedes realizar esta acción en el estado actual',
  FILES_REQUIRED: 'Debes subir archivos de evidencia',
  NOT_OTHER_PARTY: 'No puedes revisar tu propio cumplimiento',
  ALREADY_REVIEWED: 'Este cumplimiento ya fue revisado',
  OBJECTION_REQUIRED: 'Debes especificar por qué objetas',
  NOTES_TOO_SHORT: 'Las notas deben tener al menos 10 caracteres',
  FILE_TOO_LARGE: 'El archivo es demasiado grande (máximo 10MB)',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  TOO_MANY_FILES: 'Máximo 10 archivos permitidos',
};

// ============ ESTADOS QUE REQUIEREN ACCIÓN DEL USUARIO ============
export const USER_ACTION_REQUIRED_STATUSES = [
  COMPLIANCE_STATUS.PENDING,
  COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT,
  COMPLIANCE_STATUS.REJECTED,
  COMPLIANCE_STATUS.OVERDUE,
  COMPLIANCE_STATUS.WARNING,
];

// ============ ESTADOS FINALES (NO SE PUEDE ACTUAR) ============
export const FINAL_STATUSES = [
  COMPLIANCE_STATUS.APPROVED,
  COMPLIANCE_STATUS.ESCALATED,
];

// ============ ESTADOS QUE REQUIEREN REVISIÓN DEL MODERADOR ============
export const MODERATOR_REVIEW_REQUIRED_STATUSES = [
  COMPLIANCE_STATUS.SUBMITTED,
  COMPLIANCE_STATUS.PEER_APPROVED,
  COMPLIANCE_STATUS.PEER_OBJECTED,
  COMPLIANCE_STATUS.IN_REVIEW,
];

// ============ UMBRALES DE TIEMPO (en horas) ============
export const TIME_THRESHOLDS = {
  CRITICAL: 24, // Menos de 24 horas
  URGENT: 72, // Menos de 72 horas
};

// ============ INTERVALOS DE POLLING (en milisegundos) ============
export const POLLING_INTERVALS = {
  COMPLIANCES_LIST: 30000, // 30 segundos
  COMPLIANCE_DETAIL: 10000, // 10 segundos
  BADGE_COUNT: 60000, // 1 minuto
};

// ============ PAGINACIÓN ============
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

// ============ HELPERS ============

/**
 * Determina el nivel de urgencia basado en el deadline y warning level
 */
export const getUrgencyLevel = (deadline, warningLevel) => {
  // Si está escalado (warning level 3)
  if (warningLevel >= 3) {
    return URGENCY_LEVEL.CRITICAL;
  }

  // Si está en warning (warning level 2)
  if (warningLevel >= 2) {
    return URGENCY_LEVEL.CRITICAL;
  }

  // Si está overdue (warning level 1)
  if (warningLevel >= 1) {
    return URGENCY_LEVEL.URGENT;
  }

  // Calcular horas restantes
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const hoursRemaining = (deadlineDate - now) / (1000 * 60 * 60);

  if (hoursRemaining < 0) {
    return URGENCY_LEVEL.CRITICAL;
  } else if (hoursRemaining < TIME_THRESHOLDS.CRITICAL) {
    return URGENCY_LEVEL.URGENT;
  } else if (hoursRemaining < TIME_THRESHOLDS.URGENT) {
    return URGENCY_LEVEL.WARNING;
  } else {
    return URGENCY_LEVEL.NORMAL;
  }
};

/**
 * Verifica si un compliance requiere archivos
 */
export const requiresFiles = (complianceType) => {
  const typesRequiringFiles = [
    COMPLIANCE_TYPE.FULL_REFUND,
    COMPLIANCE_TYPE.PARTIAL_REFUND,
    COMPLIANCE_TYPE.FULL_REDELIVERY,
    COMPLIANCE_TYPE.CORRECTED_DELIVERY,
    COMPLIANCE_TYPE.ADDITIONAL_DELIVERY,
    COMPLIANCE_TYPE.PAYMENT_REQUIRED,
    COMPLIANCE_TYPE.EVIDENCE_UPLOAD,
  ];

  return typesRequiringFiles.includes(complianceType);
};

/**
 * Verifica si un estado permite acción del usuario
 */
export const canUserAct = (status) => {
  return USER_ACTION_REQUIRED_STATUSES.includes(status);
};

/**
 * Verifica si un estado es final
 */
export const isFinalStatus = (status) => {
  return FINAL_STATUSES.includes(status);
};

/**
 * Formatea el tiempo restante para mostrar
 */
export const formatTimeRemaining = (deadline) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate - now;

  if (diffMs < 0) {
    const hoursPast = Math.abs(Math.floor(diffMs / (1000 * 60 * 60)));
    return `Vencido hace ${hoursPast}h`;
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

/**
 * Valida tipo de archivo
 */
export const isValidFileType = (file) => {
  return COMPLIANCE_VALIDATION.ALLOWED_FILE_TYPES.includes(file.type);
};

/**
 * Valida tamaño de archivo
 */
export const isValidFileSize = (file) => {
  return file.size <= COMPLIANCE_VALIDATION.MAX_FILE_SIZE;
};
