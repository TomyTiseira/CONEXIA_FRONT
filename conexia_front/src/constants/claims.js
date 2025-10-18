/**
 * Claims Constants
 * Tipos de reclamos, estados y configuraciones
 */

// Estados de reclamos
export const CLAIM_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
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
  [CLIENT_CLAIM_TYPES.CLIENT_OTHER]: 'Otro (especificar)',
};

// Labels para tipos de reclamos (proveedor)
export const PROVIDER_CLAIM_TYPE_LABELS = {
  [PROVIDER_CLAIM_TYPES.PAYMENT_NOT_RECEIVED]: 'No se recibió el pago',
  [PROVIDER_CLAIM_TYPES.PROVIDER_OTHER]: 'Otro (especificar)',
};

// Labels para estados
export const CLAIM_STATUS_LABELS = {
  [CLAIM_STATUS.OPEN]: 'Abierto',
  [CLAIM_STATUS.IN_REVIEW]: 'En Revisión',
  [CLAIM_STATUS.RESOLVED]: 'Resuelto',
  [CLAIM_STATUS.REJECTED]: 'Rechazado',
};

// Configuración de colores para badges
export const CLAIM_STATUS_CONFIG = {
  [CLAIM_STATUS.OPEN]: {
    variant: 'warning',
    label: 'Abierto',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
  },
  [CLAIM_STATUS.IN_REVIEW]: {
    variant: 'info',
    label: 'En Revisión',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
  },
  [CLAIM_STATUS.RESOLVED]: {
    variant: 'success',
    label: 'Resuelto',
    color: 'text-green-700',
    bg: 'bg-green-100',
  },
  [CLAIM_STATUS.REJECTED]: {
    variant: 'danger',
    label: 'Rechazado',
    color: 'text-red-700',
    bg: 'bg-red-100',
  },
};

// Estados de hiring que permiten crear reclamos
export const ALLOWED_CLAIM_STATES = [
  'in_progress',
  'approved',
  'revision_requested',
  'delivered',
];

// Validaciones
export const CLAIM_VALIDATION = {
  DESCRIPTION_MIN_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 2000,
  RESOLUTION_MIN_LENGTH: 20,
  RESOLUTION_MAX_LENGTH: 2000,
  MAX_EVIDENCE_FILES: 10,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
  ],
  ALLOWED_FILE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'mp4'],
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
  INVALID_FORMAT: 'Formato no permitido. Solo JPG, PNG, GIF, PDF, DOCX, MP4',
  ALREADY_EXISTS: 'Ya existe un reclamo activo para este servicio',
  UPLOAD_ERROR: 'Error al subir archivo. Intenta nuevamente',
};

export default {
  CLAIM_STATUS,
  CLIENT_CLAIM_TYPES,
  PROVIDER_CLAIM_TYPES,
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_CONFIG,
  ALLOWED_CLAIM_STATES,
  CLAIM_VALIDATION,
  CLAIM_ERROR_MESSAGES,
};
