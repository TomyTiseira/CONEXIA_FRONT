/**
 * useComplianceSubmit Hook
 * Hook para manejar el envío de evidencias de un compliance
 */

'use client';

import { useState, useCallback } from 'react';
import { submitCompliance, validateFiles } from '@/service/compliances';
import { COMPLIANCE_VALIDATION } from '@/constants/compliances';

export const useComplianceSubmit = () => {
  const [files, setFiles] = useState([]);
  const [userNotes, setUserNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);

  const addFiles = useCallback((newFiles) => {
    const filesArray = Array.from(newFiles);
    
    // Validar que no se excedan MAX_FILES
    const totalFiles = files.length + filesArray.length;
    if (totalFiles > COMPLIANCE_VALIDATION.MAX_FILES) {
      setFileErrors([`Máximo ${COMPLIANCE_VALIDATION.MAX_FILES} archivos permitidos`]);
      return;
    }

    // Validar archivos
    const validation = validateFiles(filesArray);
    if (!validation.valid) {
      setFileErrors(validation.errors);
      return;
    }

    setFiles(prev => [...prev, ...filesArray]);
    setFileErrors([]);
  }, [files]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setFileErrors([]);
  }, []);

  const setNotes = useCallback((notes) => {
    setUserNotes(notes);
    setError(null);
  }, []);

  const submit = useCallback(async (complianceId, userId, requiresFiles = true) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validaciones
      if (requiresFiles && files.length === 0) {
        throw new Error('Debes subir al menos un archivo de evidencia');
      }

      if (userNotes.trim() && userNotes.trim().length < COMPLIANCE_VALIDATION.MIN_NOTES_LENGTH) {
        throw new Error(`Las notas deben tener al menos ${COMPLIANCE_VALIDATION.MIN_NOTES_LENGTH} caracteres`);
      }

      // Enviar
      const result = await submitCompliance(complianceId, {
        userId,
        userNotes: userNotes.trim(),
        files,
      });

      // Limpiar formulario
      clearFiles();
      setUserNotes('');

      return result;
    } catch (err) {
      console.error('Error submitting compliance:', err);
      setError(err.message || 'Error al enviar evidencia');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [files, userNotes, clearFiles]);

  const reset = useCallback(() => {
    clearFiles();
    setUserNotes('');
    setError(null);
    setFileErrors([]);
  }, [clearFiles]);

  const getCharacterCount = useCallback(() => {
    return {
      current: userNotes.length,
      min: COMPLIANCE_VALIDATION.MIN_NOTES_LENGTH,
      max: COMPLIANCE_VALIDATION.MAX_NOTES_LENGTH,
      isValid: userNotes.length >= COMPLIANCE_VALIDATION.MIN_NOTES_LENGTH && 
               userNotes.length <= COMPLIANCE_VALIDATION.MAX_NOTES_LENGTH,
    };
  }, [userNotes]);

  return {
    files,
    userNotes,
    isSubmitting,
    error,
    fileErrors,
    addFiles,
    removeFile,
    clearFiles,
    setNotes,
    submit,
    reset,
    getCharacterCount,
  };
};
