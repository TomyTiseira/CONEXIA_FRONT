/**
 * Utilidades para validación de archivos de imagen
 */

/**
 * Valida si un archivo es una imagen válida
 * @param {File} file - Archivo a validar
 * @param {number} maxSize - Tamaño máximo en bytes
 * @param {string[]} allowedTypes - Tipos MIME permitidos
 * @returns {Object} { isValid: boolean, error: string }
 */
export function validateImageFile(file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png']) {
  if (!file) {
    return { isValid: false, error: 'Archivo no válido' };
  }

  // Validar tipo de archivo
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Formato no válido. Solo JPG y PNG permitidos' };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return { isValid: false, error: `Tamaño máximo ${maxSizeMB}MB excedido` };
  }

  return { isValid: true, error: '' };
}

/**
 * Valida un array de archivos de imagen
 * @param {File[]} files - Archivos a validar
 * @param {number} maxFiles - Número máximo de archivos
 * @param {number} maxSize - Tamaño máximo por archivo en bytes
 * @param {string[]} allowedTypes - Tipos MIME permitidos
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateImageFiles(files, maxFiles = 5, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png']) {
  const errors = [];

  if (files.length > maxFiles) {
    errors.push(`Máximo ${maxFiles} archivos permitidos`);
  }

  files.forEach((file, index) => {
    const validation = validateImageFile(file, maxSize, allowedTypes);
    if (!validation.isValid) {
      errors.push(`Archivo ${index + 1}: ${validation.error}`);
    }
  });

  return { isValid: errors.length === 0, errors };
}

/**
 * Verifica si hay archivos duplicados por nombre y tamaño
 * @param {File[]} existingFiles - Archivos existentes
 * @param {File[]} newFiles - Archivos nuevos a agregar
 * @returns {File[]} Archivos filtrados sin duplicados
 */
export function filterDuplicateFiles(existingFiles, newFiles) {
  return newFiles.filter(newFile => {
    return !existingFiles.some(existingFile => 
      existingFile.name === newFile.name && existingFile.size === newFile.size
    );
  });
}

/**
 * Genera una URL de vista previa para un archivo de imagen
 * @param {File} file - Archivo de imagen
 * @returns {string} URL de objeto para vista previa
 */
export function createImagePreviewUrl(file) {
  if (!file || !file.type.startsWith('image/')) {
    return '';
  }
  return URL.createObjectURL(file);
}

/**
 * Libera las URLs de objeto creadas para vistas previas
 * @param {string[]} urls - URLs a liberar
 */
export function revokeImagePreviewUrls(urls) {
  urls.forEach(url => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}