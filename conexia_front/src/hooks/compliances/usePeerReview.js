/**
 * usePeerReview Hook
 * Hook para manejar el peer review de un compliance
 */

'use client';

import { useState, useCallback } from 'react';
import { peerReviewCompliance } from '@/service/compliances';
import { COMPLIANCE_VALIDATION } from '@/constants/compliances';

export const usePeerReview = () => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState(null);
  const [showObjectionInput, setShowObjectionInput] = useState(false);
  const [objection, setObjection] = useState('');

  const approve = useCallback(async (complianceId, userId) => {
    try {
      setIsReviewing(true);
      setError(null);

      const result = await peerReviewCompliance(complianceId, {
        userId,
        approved: true,
      });

      return result;
    } catch (err) {
      console.error('Error approving compliance:', err);
      setError(err.message || 'Error al aprobar');
      throw err;
    } finally {
      setIsReviewing(false);
    }
  }, []);

  const object = useCallback(async (complianceId, userId, objectionText) => {
    try {
      setIsReviewing(true);
      setError(null);

      // Validar objeción
      if (!objectionText || objectionText.trim().length < COMPLIANCE_VALIDATION.MIN_OBJECTION_LENGTH) {
        throw new Error(`La objeción debe tener al menos ${COMPLIANCE_VALIDATION.MIN_OBJECTION_LENGTH} caracteres`);
      }

      const result = await peerReviewCompliance(complianceId, {
        userId,
        approved: false,
        objection: objectionText.trim(),
      });

      // Limpiar
      setObjection('');
      setShowObjectionInput(false);

      return result;
    } catch (err) {
      console.error('Error objecting compliance:', err);
      setError(err.message || 'Error al objetar');
      throw err;
    } finally {
      setIsReviewing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setObjection('');
    setShowObjectionInput(false);
    setError(null);
  }, []);

  const toggleObjectionInput = useCallback(() => {
    setShowObjectionInput(prev => !prev);
    setError(null);
  }, []);

  const updateObjection = useCallback((text) => {
    setObjection(text);
    setError(null);
  }, []);

  const getObjectionCharacterCount = useCallback(() => {
    return {
      current: objection.length,
      min: COMPLIANCE_VALIDATION.MIN_OBJECTION_LENGTH,
      max: COMPLIANCE_VALIDATION.MAX_OBJECTION_LENGTH,
      isValid: objection.length >= COMPLIANCE_VALIDATION.MIN_OBJECTION_LENGTH && 
               objection.length <= COMPLIANCE_VALIDATION.MAX_OBJECTION_LENGTH,
    };
  }, [objection]);

  return {
    isReviewing,
    error,
    showObjectionInput,
    objection,
    approve,
    object,
    reset,
    toggleObjectionInput,
    updateObjection,
    getObjectionCharacterCount,
  };
};
