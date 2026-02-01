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

  // Validar extensión primero (más confiable)
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!CLAIM_VALIDATION.ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    return CLAIM_ERROR_MESSAGES.INVALID_FORMAT;
  }

  // Validar tipo MIME solo si está presente y no está vacío
  // Algunos navegadores no envían el tipo MIME correctamente para ciertos archivos
  if (file.type && !CLAIM_VALIDATION.ALLOWED_FILE_TYPES.includes(file.type)) {
    // Permitir si la extensión es válida pero el MIME type no coincide (común en PDFs)
    const mimeExtensionMap = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
    };
    
    // Si la extensión está en el mapa, permitir el archivo
    if (!mimeExtensionMap[extension]) {
      return CLAIM_ERROR_MESSAGES.INVALID_FORMAT;
    }
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
  if (!url) return 'Documento.pdf';
  
  try {
    // Si es una URL completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const segments = pathname.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      if (lastSegment && lastSegment.includes('.')) {
        // Decodificar caracteres URL y retornar el nombre del archivo
        return decodeURIComponent(lastSegment);
      }
    } else {
      // Si es una ruta relativa
      const segments = url.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      
      if (lastSegment && lastSegment.includes('.')) {
        return decodeURIComponent(lastSegment);
      }
    }
    
    // Si llegamos aquí, intentar obtener la extensión de la URL
    const extension = url.toLowerCase().match(/\.(pdf|docx?|xlsx?|pptx?|txt|jpg|jpeg|png|gif|mp4|mov|avi)$/i);
    if (extension) {
      return `Documento${extension[0]}`;
    }
    
    return 'Documento.pdf';
  } catch (error) {
    console.error('Error extracting filename from URL:', error);
    // Intentar obtener extensión incluso en caso de error
    const extension = url.toLowerCase().match(/\.(pdf|docx?|xlsx?|pptx?|txt|jpg|jpeg|png|gif|mp4|mov|avi)$/i);
    return extension ? `Documento${extension[0]}` : 'Documento.pdf';
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

const claimValidation = {
  validateFile,
  validateFiles,
  validateDescription,
  validateResolution,
  getFileNameFromUrl,
  getFileType,
  formatFileSize,
};

export default claimValidation;
