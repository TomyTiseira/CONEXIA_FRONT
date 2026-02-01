/**
 * PeerReviewComplianceModal Component
 * Modal unificado para que la otra parte del reclamo revise la evidencia de un compromiso
 * Permite pre-aprobar o pre-rechazar con argumentos
 */

'use client';

import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { peerReviewCompliance } from '@/service/claims';

const MIN_OBJECTION_LENGTH = 20;
const MAX_OBJECTION_LENGTH = 500;
const MAX_NOTES_LENGTH = 500;

export const PeerReviewComplianceModal = ({
  compliance,
  onClose,
  onSuccess,
  claimant,
  otherUser,
  currentUserId,
}) => {
  const [decision, setDecision] = useState(null); // 'approve' | 'reject'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!decision) {
      setError('Debes seleccionar una decisión (Aprobar o Rechazar)');
      return;
    }

    if (decision === 'reject') {
      const trimmedNotes = notes.trim();
      if (!trimmedNotes) {
        setError('Debes proporcionar una razón para rechazar la evidencia');
        return;
      }
      if (trimmedNotes.length < MIN_OBJECTION_LENGTH) {
        setError(`La razón debe tener al menos ${MIN_OBJECTION_LENGTH} caracteres`);
        return;
      }
      if (trimmedNotes.length > MAX_OBJECTION_LENGTH) {
        setError(`La razón no puede exceder ${MAX_OBJECTION_LENGTH} caracteres`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        approved: decision === 'approve',
      };

      // Agregar reason solo si hay notas
      if (notes.trim()) {
        reviewData.reason = notes.trim();
      }

      await peerReviewCompliance(compliance.id, reviewData);
      
      const successMessage = decision === 'approve'
        ? 'Evidencia preaprobada exitosamente. El moderador realizará la revisión final.'
        : 'Evidencia prerechazada exitosamente. El moderador realizará la revisión final.';
      
      if (onSuccess) {
        onSuccess(successMessage);
      }
      onClose();
    } catch (err) {
      console.error('Error reviewing compliance:', err);
      setError(err.message || 'Error al procesar la revisión. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNotesRequired = decision === 'reject';
  const notesPlaceholder = decision === 'approve' 
    ? 'Comentarios opcionales sobre el compromiso...' 
    : 'Explica por qué rechazas este compromiso...';
  const maxLength = decision === 'reject' ? MAX_OBJECTION_LENGTH : MAX_NOTES_LENGTH;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-200 flex-shrink-0 bg-purple-100 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-900">Revisar compromiso (Revisión de pares)</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6 bg-gray-50">
            {/* Compromiso Seleccionado */}
            <div className="space-y-4">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="text-base font-bold text-purple-900 mb-1">
                  Compromiso seleccionado
                </h3>
                <p className="text-sm text-purple-800 font-medium">
                  Este es el compromiso que vas a revisar:
                </p>
              </div>
              <div>
                <ComplianceCard
                  compliance={compliance}
                  claimant={claimant}
                  otherUser={otherUser}
                  currentUserId={currentUserId}
                  canUpload={false}
                  hideFooter={true}
                />
              </div>
            </div>

            {/* Separador */}
            <div className="border-t-2 border-dashed border-gray-300"></div>

            {/* Sección de Decisión */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-base text-gray-900 mb-4">
                Tu decisión
              </h3>

              {/* Selector de decisión */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">
                  Selecciona tu decisión <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDecision('approve');
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      decision === 'approve'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-green-300 hover:bg-green-50/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsUp size={32} className={decision === 'approve' ? 'text-green-600' : 'text-gray-400'} />
                      <span className={`font-semibold ${decision === 'approve' ? 'text-green-900' : 'text-gray-600'}`}>
                        Preaprobar
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        La evidencia es válida
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDecision('reject');
                      setError('');
                    }}
                    disabled={isSubmitting}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      decision === 'reject'
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-300 hover:border-orange-300 hover:bg-orange-50/50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ThumbsDown size={32} className={decision === 'reject' ? 'text-orange-600' : 'text-gray-400'} />
                      <span className={`font-semibold ${decision === 'reject' ? 'text-orange-900' : 'text-gray-600'}`}>
                        Prerechazar
                      </span>
                      <span className="text-xs text-gray-500 text-center">
                        La evidencia no es válida
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campo de notas/razón */}
              {decision && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {decision === 'approve' ? 'Comentarios (Opcional)' : 'Razón del Rechazo'}{' '}
                    {decision === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <InputField
                    name="notes"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setError('');
                    }}
                    placeholder={notesPlaceholder}
                    multiline
                    rows={4}
                    maxLength={maxLength}
                    showCharCount
                    required={isNotesRequired}
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    {decision === 'reject' 
                      ? `Mínimo ${MIN_OBJECTION_LENGTH} caracteres`
                      : `Máximo ${MAX_NOTES_LENGTH} caracteres`
                    }
                  </p>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3 flex-shrink-0 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            variant="cancel"
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant={decision === 'approve' ? 'green' : decision === 'reject' ? 'warning' : 'primary'}
            disabled={isSubmitting || !decision}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Procesando...
              </span>
            ) : decision === 'approve' ? (
              <span className="flex items-center gap-2">
                <ThumbsUp size={16} />
                Confirmar preaprobación
              </span>
            ) : decision === 'reject' ? (
              <span className="flex items-center gap-2">
                <ThumbsDown size={16} />
                Confirmar prerechazo
              </span>
            ) : (
              'Selecciona una decisión'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
