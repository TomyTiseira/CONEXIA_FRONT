/**
 * useEvidenceUpload Hook
 * Manejo de archivos de evidencia para reclamos
 */

import { useState, useCallback } from 'react';
import { validateFiles } from '@/utils/claimValidation';

/**
 * Hook para manejar archivos de evidencia
 * @returns {Object} - Estado y funciones para gestionar archivos
 */
export const useEvidenceUpload = () => {
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);

  /**
   * Agrega archivos a la lista
   */
  const addFiles = useCallback(
    (newFiles) => {
      // Validar archivos nuevos
      const validation = validateFiles([...files, ...Array.from(newFiles)]);

      if (!validation.valid) {
        setErrors(validation.errors);
        return false;
      }

      setFiles((prev) => [...prev, ...Array.from(newFiles)]);
      setErrors([]);
      return true;
    },
    [files]
  );

  /**
   * Remueve un archivo de la lista
   */
  const removeFile = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors([]);
  }, []);

  /**
   * Limpia todos los archivos y estado
   */
  const reset = useCallback(() => {
    setFiles([]);
    setErrors([]);
  }, []);

  return {
    files,
    errors,
    addFiles,
    removeFile,
    reset,
    hasFiles: files.length > 0,
    hasErrors: errors.length > 0,
  };
};

export default useEvidenceUpload;
