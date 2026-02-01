/**
 * ReviewComplianceModal Component
 * Modal para que el moderador/admin apruebe o rechace la evidencia de un compromiso
 */

'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import { reviewCompliance } from '@/service/claims';

const MIN_NOTES_LENGTH = 20;
const MAX_NOTES_LENGTH = 1000;

export const ReviewComplianceModal = ({
  compliance,
  onClose,
  onSuccess,
  showToast,
  claimant,
  otherUser,
  currentUserId,
}) => {
  const [decision, setDecision] = useState('approve'); // 'approve' | 'reject'
  const [moderatorNotes, setModeratorNotes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedNotes = moderatorNotes.trim();

    // Validar notas
    if (trimmedNotes.length < MIN_NOTES_LENGTH) {
      setError(`Las notas deben tener al menos ${MIN_NOTES_LENGTH} caracteres`);
      return;
    }

    if (trimmedNotes.length > MAX_NOTES_LENGTH) {
      setError(`Las notas no pueden exceder ${MAX_NOTES_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewCompliance(compliance.id, {
        decision,
        moderatorNotes: trimmedNotes,
      });

      onClose();
      setModeratorNotes('');
      setDecision('approve');

      const successMessage = decision === 'approve' 
        ? 'Compromiso aprobado exitosamente. El usuario será notificado.'
        : 'Compromiso rechazado. El usuario deberá volver a enviar evidencia.';

      if (showToast) {
        showToast('success', successMessage);
      }

      if (onSuccess) {
        onSuccess(successMessage);
      }
    } catch (err) {
      console.error('Error reviewing compliance:', err);
      
      if (showToast) {
        showToast('error', err.message || 'Error al revisar el compromiso. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = moderatorNotes.trim().length;
  const isValid = characterCount >= MIN_NOTES_LENGTH && characterCount <= MAX_NOTES_LENGTH;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Revisar compromiso (Moderador)</h2>
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
              {/* Explicación de acción */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <h3 className="text-base font-bold text-purple-900 mb-1">
                  Compromiso a Revisar
                </h3>
                <p className="text-sm text-purple-800 font-medium">
                  Revisa la evidencia enviada por el usuario para este compromiso:
                </p>
              </div>

              {/* Advertencia si es rechazo */}
              {decision === 'reject' && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                  <p className="text-sm font-bold text-yellow-900 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    ¿Qué sucede al rechazar este compromiso?
                  </p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                    {compliance.rejectionCount === 0 && (
                      <>
                        <li>El usuario recibirá una advertencia por email</li>
                        <li>El compromiso volverá a estado pendiente</li>
                        <li>Tendrá {compliance.maxAttempts - 1} intentos más para cumplir</li>
                        <li>Podrá reenviar evidencia corregida</li>
                      </>
                    )}
                    {compliance.rejectionCount === 1 && (
                      <>
                        <li>El usuario será <strong>suspendido automáticamente por 15 días</strong></li>
                        <li>No podrá acceder a la plataforma durante la suspensión</li>
                        <li>El compromiso quedará marcado como rechazado</li>
                        <li>Esta acción es automática e irreversible</li>
                      </>
                    )}
                    {compliance.rejectionCount >= 2 && (
                      <>
                        <li>El usuario será <strong>baneado permanentemente</strong> de la plataforma</li>
                        <li>Perderá acceso completo a su cuenta</li>
                        <li>Esta acción es irreversible</li>
                        <li>Por favor, verifica cuidadosamente antes de proceder</li>
                      </>
                    )}
                  </ul>
                </div>
              )}

              {/* Tarjeta del compromiso */}
              <div>
                <ComplianceCard
                  compliance={compliance}
                  currentUserId={currentUserId}
                  canUpload={false}
                  onUploadEvidence={() => {}}
                  claimant={claimant}
                  otherUser={otherUser}
                  hideFooter={true}
                />
              </div>

              {/* Decisión */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <h3 className="font-bold text-base text-gray-900 mb-4">
                  Decisión de Revisión
                </h3>
                
                {/* Advertencia si el compliance ya tiene rechazos */}
                {compliance.rejectionCount > 0 && (
                  <div className="mb-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <p className="text-sm font-bold text-yellow-900 mb-1 flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Este compromiso ya fue rechazado {compliance.rejectionCount} {compliance.rejectionCount === 1 ? 'vez' : 'veces'}
                    </p>
                    <p className="text-xs text-yellow-800">
                      Intento actual: {compliance.currentAttempt} de {compliance.maxAttempts}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setDecision('approve')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      decision === 'approve'
                        ? 'border-green-500 bg-green-50 text-green-900'
                        : 'border-gray-200 hover:border-green-200 hover:bg-green-50/50'
                    }`}
                  >
                    <CheckCircle size={32} className={`mx-auto mb-2 ${
                      decision === 'approve' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-sm">Aprobar</p>
                    <p className="text-xs text-gray-600 mt-1">
                      El compromiso se marcará como cumplido
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setDecision('reject')}
                    className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                      decision === 'reject'
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-red-200 hover:bg-red-50/50'
                    }`}
                  >
                    <XCircle size={32} className={`mx-auto mb-2 ${
                      decision === 'reject' ? 'text-red-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold text-sm">Rechazar</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {compliance.rejectionCount === 0 && 'Recibirá una advertencia'}
                      {compliance.rejectionCount === 1 && 'Será suspendido 15 días'}
                      {compliance.rejectionCount === 2 && 'Será baneado permanentemente'}
                      {compliance.rejectionCount >= 3 && 'No hay más intentos'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Notas del moderador (obligatorias) */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de revisión <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={6}
                  name="moderatorNotes"
                  placeholder={
                    decision === 'approve'
                      ? 'Explica por qué apruebas esta evidencia. Ej: La evidencia presentada cumple con todos los requisitos del compromiso...'
                      : 'Explica por qué rechazas esta evidencia y qué debe corregir el usuario. Ej: La evidencia no muestra el comprobante de pago completo...'
                  }
                  value={moderatorNotes}
                  onChange={(e) => {
                    setModeratorNotes(e.target.value);
                    setError(null);
                  }}
                  maxLength={MAX_NOTES_LENGTH}
                  disabled={isSubmitting}
                  showCharCount={true}
                  error={error}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {MIN_NOTES_LENGTH} caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
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
                variant={decision === 'approve' ? 'success' : 'danger'}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {decision === 'approve' ? (
                      <>
                        <CheckCircle size={18} />
                        Aprobar Compromiso
                      </>
                    ) : (
                      <>
                        <XCircle size={18} />
                        Rechazar Evidencia
                      </>
                    )}
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

export default ReviewComplianceModal;
