/**
 * AddObservationsModal Component
 * Modal para que admin/moderador agregue observaciones a un reclamo
 * Cambia el estado del reclamo a "Pendiente subsanación"
 */

'use client';

import React, { useState } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import { addObservations } from '@/service/claims';
import { CLAIM_VALIDATION } from '@/constants/claims';
import Toast from '@/components/ui/Toast';

export const AddObservationsModal = ({ isOpen, onClose, claim, onSuccess, showToast }) => {
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedObservations = observations.trim();

    // Validar observaciones
    if (trimmedObservations.length < CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH) {
      setError(`Las observaciones deben tener al menos ${CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH} caracteres`);
      return;
    }

    if (trimmedObservations.length > CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH) {
      setError(`Las observaciones no pueden exceder ${CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedClaim = await addObservations(claim.id, {
        observations: trimmedObservations,
      });

      // Cerrar modal inmediatamente
      onClose();
      setObservations('');

      // Mostrar toast en la página padre
      if (showToast) {
        showToast('success', 'Observaciones agregadas exitosamente. El usuario será notificado.');
      }

      // Actualizar claim en el padre
      if (onSuccess) {
        onSuccess(updatedClaim);
      }
    } catch (err) {
      console.error('Error adding observations:', err);
      
      // Mostrar error en la página padre
      if (showToast) {
        showToast('error', err.message || 'Error al agregar observaciones. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setObservations('');
      setError(null);
    }
  };

  const characterCount = observations.trim().length;
  const minLength = CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH;
  const maxLength = CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare size={24} className="text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar Observaciones - Pendiente subsanación
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info del reclamo */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reclamo:</span> {claim.claimTypeLabel || claim.claimType}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Reclamante:</span>{' '}
                {claim.claimantFirstName && claim.claimantLastName
                  ? `${claim.claimantFirstName} ${claim.claimantLastName}`
                  : claim.claimantName || 'N/A'}{' '}
                ({claim.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Servicio:</span>{' '}
                {claim.hiring?.service?.title || 'N/A'}
              </p>
            </div>

            {/* Explicación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">¿Qué sucede al agregar observaciones?</span>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>El reclamo cambiará a estado "Pendiente subsanación"</li>
                <li>El usuario reclamante recibirá un email con tus observaciones</li>
                <li>El usuario podrá responder o actualizar su reclamo</li>
              </ul>
            </div>

            {/* Campo de observaciones */}
            <div>
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones <span className="text-red-500">*</span>
              </label>
              <textarea
                id="observations"
                value={observations}
                onChange={(e) => {
                  setObservations(e.target.value);
                  setError(null);
                }}
                placeholder="Escribe las observaciones que el usuario debe atender. Sé específico sobre qué información o evidencia adicional necesitas..."
                rows={8}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />

              {/* Contador de caracteres */}
              <div className="flex items-center justify-between mt-2">
                <p
                  className={`text-sm ${
                    characterCount < minLength
                      ? 'text-gray-500'
                      : characterCount > maxLength
                      ? 'text-red-600 font-medium'
                      : 'text-green-600'
                  }`}
                >
                  {characterCount} / {maxLength} caracteres
                  {characterCount < minLength && ` (mínimo ${minLength})`}
                </p>
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    Enviar observaciones
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddObservationsModal;
