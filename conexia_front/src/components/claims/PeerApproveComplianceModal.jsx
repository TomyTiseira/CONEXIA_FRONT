/**
 * PeerApproveComplianceModal Component
 * Modal para que la otra parte del reclamo pre-apruebe la evidencia de un compromiso
 */

'use client';

import React, { useState } from 'react';
import { X, ThumbsUp, Loader2 } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { peerReviewCompliance } from '@/service/claims';

export const PeerApproveComplianceModal = ({
  compliance,
  onClose,
  onSuccess,
  showToast,
  claimant,
  otherUser,
  currentUserId,
}) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      await peerReviewCompliance(compliance.id, {
        approved: true,
        reason: notes.trim() || undefined,
      });

      onClose();
      setNotes('');

      if (showToast) {
        showToast('success', 'Evidencia pre-aprobada exitosamente. El moderador realizará la revisión final.');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error peer approving compliance:', err);
      
      if (showToast) {
        showToast('error', err.message || 'Error al pre-aprobar la evidencia. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Pre-aprobar evidencia de compromiso</h2>
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
              {/* Compromiso a aprobar */}
              <div className="space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <h3 className="text-base font-bold text-purple-900 mb-1">
                    Compromiso a Pre-aprobar
                  </h3>
                  <p className="text-sm text-purple-800 font-medium">
                    Estás por pre-aprobar la evidencia enviada para este compromiso:
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
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-900 font-semibold mb-2">
                  ¿Qué sucede al pre-aprobar?
                </p>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Tu aprobación será enviada al moderador</li>
                  <li>El moderador realizará la revisión final</li>
                  <li>Si el moderador aprueba, el compromiso se marcará como cumplido</li>
                </ul>
              </div>

              {/* Notas opcionales */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <InputField
                  multiline
                  rows={4}
                  name="notes"
                  placeholder="Puedes agregar comentarios sobre la evidencia recibida..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                  showCharCount={true}
                />
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
                disabled={isSubmitting}
                variant="success"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ThumbsUp size={18} />
                    Pre-aprobar Evidencia
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

export default PeerApproveComplianceModal;
