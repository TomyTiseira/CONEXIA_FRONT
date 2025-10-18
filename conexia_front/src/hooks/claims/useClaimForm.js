/**
 * useClaimForm Hook
 * Manejo del formulario de creación de reclamos
 */

import { useState, useCallback } from 'react';
import { validateDescription } from '@/utils/claimValidation';
import {
  CLAIM_ERROR_MESSAGES,
  CLAIM_VALIDATION,
  CLIENT_CLAIM_TYPES,
  PROVIDER_CLAIM_TYPES,
} from '@/constants/claims';

/**
 * Hook para manejar el formulario de reclamo
 * @param {boolean} isClient - Si el usuario es cliente
 * @returns {Object} - Estado y funciones del formulario
 */
export const useClaimForm = (isClient) => {
  const [formData, setFormData] = useState({
    claimType: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Actualiza un campo del formulario
   */
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error al escribir
    setErrors((prev) => ({
      ...prev,
      [field]: null,
    }));
  }, []);

  /**
   * Marca un campo como tocado
   */
  const setFieldTouched = useCallback((field) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  /**
   * Valida el tipo de reclamo
   */
  const validateClaimType = useCallback(() => {
    if (!formData.claimType) {
      return CLAIM_ERROR_MESSAGES.CLAIM_TYPE_REQUIRED;
    }

    // Validar que el tipo sea válido para el rol
    const validTypes = isClient
      ? Object.values(CLIENT_CLAIM_TYPES)
      : Object.values(PROVIDER_CLAIM_TYPES);

    if (!validTypes.includes(formData.claimType)) {
      return 'Tipo de reclamo no válido para tu rol';
    }

    return null;
  }, [formData.claimType, isClient]);

  /**
   * Valida la descripción
   */
  const validateDescriptionField = useCallback(() => {
    return validateDescription(formData.description);
  }, [formData.description]);

  /**
   * Valida todo el formulario
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    const claimTypeError = validateClaimType();
    if (claimTypeError) {
      newErrors.claimType = claimTypeError;
    }

    const descriptionError = validateDescriptionField();
    if (descriptionError) {
      newErrors.description = descriptionError;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [validateClaimType, validateDescriptionField]);

  /**
   * Obtiene el contador de caracteres
   */
  const getCharacterCount = useCallback(() => {
    const length = formData.description.trim().length;
    const min = CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH;
    const max = CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH;

    return {
      current: length,
      min,
      max,
      isValid: length >= min && length <= max,
      isTooShort: length < min,
      isTooLong: length > max,
    };
  }, [formData.description]);

  /**
   * Resetea el formulario
   */
  const reset = useCallback(() => {
    setFormData({
      claimType: '',
      description: '',
    });
    setErrors({});
    setTouched({});
  }, []);

  return {
    formData,
    errors,
    touched,
    setField,
    setFieldTouched,
    validateForm,
    validateClaimType,
    validateDescription: validateDescriptionField,
    getCharacterCount,
    reset,
    isValid: Object.keys(errors).length === 0 && formData.claimType && formData.description,
  };
};

export default useClaimForm;
