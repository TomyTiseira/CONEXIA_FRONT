/**
 * Claim Validation Utilities
 */

import { CLAIM_VALIDATION, CLAIM_ERROR_MESSAGES } from '@/constants/claims';

/**
 * Valida un archivo individual
 * @param {File} file - Archivo a validar
 * @returns {string | null} - Mensaje de error o null si es válido
 */
export const validateFile = (file) => {
  if (!file) {
    return 'Archivo no válido';
  }

  // Validar tamaño
  if (file.size > CLAIM_VALIDATION.MAX_FILE_SIZE) {
    return CLAIM_ERROR_MESSAGES.MAX_SIZE;
  }

  // Validar tipo MIME
  if (!CLAIM_VALIDATION.ALLOWED_FILE_TYPES.includes(file.type)) {
    return CLAIM_ERROR_MESSAGES.INVALID_FORMAT;
  }

  // Validar extensión (backup)
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!CLAIM_VALIDATION.ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    return CLAIM_ERROR_MESSAGES.INVALID_FORMAT;
  }

  return null;
};

/**
 * Valida múltiples archivos
 * @param {File[]} files - Array de archivos
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateFiles = (files) => {
  const errors = [];

  // Validar cantidad
  if (files.length > CLAIM_VALIDATION.MAX_EVIDENCE_FILES) {
    errors.push(CLAIM_ERROR_MESSAGES.MAX_FILES);
    return { valid: false, errors };
  }

  // Validar cada archivo
  files.forEach((file, index) => {
    const error = validateFile(file);
    if (error) {
      errors.push(`Archivo ${index + 1}: ${error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida la descripción del reclamo
 * @param {string} description - Descripción a validar
 * @returns {string | null} - Mensaje de error o null si es válida
 */
export const validateDescription = (description) => {
  if (!description || description.trim().length === 0) {
    return CLAIM_ERROR_MESSAGES.DESCRIPTION_REQUIRED;
  }

  const length = description.trim().length;

  if (length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH) {
    return CLAIM_ERROR_MESSAGES.DESCRIPTION_MIN_LENGTH;
  }

  if (length > CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return CLAIM_ERROR_MESSAGES.DESCRIPTION_MAX_LENGTH;
  }

  return null;
};

/**
 * Valida la resolución del reclamo (admin)
 * @param {string} resolution - Resolución a validar
 * @returns {string | null} - Mensaje de error o null si es válida
 */
export const validateResolution = (resolution) => {
  if (!resolution || resolution.trim().length === 0) {
    return 'La resolución es requerida';
  }

  const length = resolution.trim().length;

  if (length < CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH) {
    return CLAIM_ERROR_MESSAGES.RESOLUTION_MIN_LENGTH;
  }

  if (length > CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH) {
    return CLAIM_ERROR_MESSAGES.RESOLUTION_MAX_LENGTH;
  }

  return null;
};

/**
 * Obtiene el nombre del archivo desde una URL
 * @param {string} url - URL del archivo
 * @returns {string} - Nombre del archivo
 */
export const getFileNameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/');
    return segments[segments.length - 1] || 'archivo';
  } catch {
    return 'archivo';
  }
};

/**
 * Obtiene el tipo de archivo desde una URL o nombre
 * @param {string} urlOrName - URL o nombre del archivo
 * @returns {string} - Tipo de archivo (image, document, video, other)
 */
export const getFileType = (urlOrName) => {
  const extension = urlOrName.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    return 'image';
  }

  if (['pdf', 'docx', 'doc'].includes(extension)) {
    return 'document';
  }

  if (['mp4', 'avi', 'mov'].includes(extension)) {
    return 'video';
  }

  return 'other';
};

/**
 * Formatea el tamaño de archivo
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} - Tamaño formateado (ej: "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default {
  validateFile,
  validateFiles,
  validateDescription,
  validateResolution,
  getFileNameFromUrl,
  getFileType,
  formatFileSize,
};
