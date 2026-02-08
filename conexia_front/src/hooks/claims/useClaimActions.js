/**
 * useClaimActions Hook
 * Hook para gestionar las acciones sobre un reclamo
 * (enviar observaciones, subir cumplimiento, etc.)
 */

'use client';

import { useState, useCallback } from 'react';
import { submitObservations, submitCompliance } from '@/service/claims';

export const useClaimActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Enviar observaciones
   */
  const sendObservations = useCallback(async (claimId, data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await submitObservations(claimId, data);
      setSuccess(true);
      return { success: true };
    } catch (err) {
      console.error('Error sending observations:', err);
      setError(err.message || 'Error al enviar observaciones');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subir cumplimiento
   */
  const uploadCompliance = useCallback(async (claimId, complianceId, data) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await submitCompliance(claimId, complianceId, data);
      setSuccess(true);
      return { success: true };
    } catch (err) {
      console.error('Error uploading compliance:', err);
      setError(err.message || 'Error al subir cumplimiento');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset estados
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    sendObservations,
    uploadCompliance,
    reset,
  };
};
