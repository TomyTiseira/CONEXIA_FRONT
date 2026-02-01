/**
 * PeerObjectComplianceModal Component
 * Modal para que la otra parte del reclamo objete la evidencia de un compromiso
 */

'use client';

import React, { useState } from 'react';
import { X, ThumbsDown, Loader2 } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { peerObjectCompliance } from '@/service/claims';

const MIN_OBJECTION_LENGTH = 20;
const MAX_OBJECTION_LENGTH = 500;

export const PeerObjectComplianceModal = ({
  compliance,
  onClose,
  onSuccess,
  showToast,
  claimant,
  otherUser,
  currentUserId,
}) => {
  const [objectionReason, setObjectionReason] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedReason = objectionReason.trim();

    // Validar razón
    if (trimmedReason.length < MIN_OBJECTION_LENGTH) {
      setError(`La razón debe tener al menos ${MIN_OBJECTION_LENGTH} caracteres`);
      return;
    }

    if (trimmedReason.length > MAX_OBJECTION_LENGTH) {
      setError(`La razón no puede exceder ${MAX_OBJECTION_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await peerObjectCompliance(compliance.id, {
        objectionReason: trimmedReason,
      });

      onClose();
      setObjectionReason('');

      if (showToast) {
        showToast('success', 'Objeción registrada exitosamente. El moderador realizará la revisión final.');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error peer objecting compliance:', err);
      
      if (showToast) {
        showToast('error', err.message || 'Error al objetar la evidencia. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = objectionReason.trim().length;
  const isValid = characterCount >= MIN_OBJECTION_LENGTH && characterCount <= MAX_OBJECTION_LENGTH;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Objetar evidencia de compromiso</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Content - Con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
              {/* Compromiso a objetar */}
              <div className="space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <h3 className="text-base font-bold text-purple-900 mb-1">
                    Compromiso a Objetar
                  </h3>
                  <p className="text-sm text-purple-800 font-medium">
                    Estás por objetar la evidencia enviada para este compromiso:
                  </p>
                </div>
                <div>
                  <ComplianceCard
                    compliance={compliance}
                    currentUserId={currentUserId}
                    canUpload={false}
                    onUploadEvidence={() => {}}
                    claimant={claimant}
                    otherUser={otherUser}
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t-2 border-dashed border-gray-300"></div>

              {/* Información */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-900 font-semibold mb-2">
                  ¿Qué sucede al objetar?
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Tu objeción será enviada al moderador</li>
                  <li>El moderador revisará tu objeción y la evidencia</li>
                  <li>El moderador tomará la decisión final</li>
                </ul>
              </div>

              {/* Razón de objeción (obligatoria) */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de la objeción <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={6}
                  name="objectionReason"
                  placeholder="Explica por qué consideras que la evidencia no es suficiente o no cumple con el compromiso..."
                  value={objectionReason}
                  onChange={(e) => {
                    setObjectionReason(e.target.value);
                    setError(null);
                  }}
                  maxLength={MAX_OBJECTION_LENGTH}
                  disabled={isSubmitting}
                  showCharCount={true}
                  error={error}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {MIN_OBJECTION_LENGTH} caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                variant="cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                variant="warning"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ThumbsDown size={18} />
                    Objetar Evidencia
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PeerObjectComplianceModal;
