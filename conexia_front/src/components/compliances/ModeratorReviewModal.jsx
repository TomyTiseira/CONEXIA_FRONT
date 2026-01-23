/**
 * ModeratorReviewModal Component
 * Modal para que el moderador revise y apruebe/rechace/ajuste un compliance
 */

'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Edit, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { moderatorReviewCompliance } from '@/service/compliances';
import { ComplianceTypeBadge } from './ComplianceTypeBadge';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import Toast from '@/components/ui/Toast';

export const ModeratorReviewModal = ({ 
  isOpen, 
  onClose, 
  compliance,
  moderatorId,
  onSuccess 
}) => {
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });
  const [decision, setDecision] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !compliance) return null;

  const handleDecision = async (selectedDecision) => {
    if (!notes.trim() && selectedDecision !== 'approve') {
      setToast({
        isVisible: true,
        type: 'error',
        message: 'Debes agregar notas explicativas',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        moderatorId,
        decision: selectedDecision,
        moderatorNotes: notes.trim(),
      };

      if (selectedDecision === 'reject') {
        payload.rejectionReason = notes.trim();
      } else if (selectedDecision === 'adjust') {
        payload.adjustmentInstructions = notes.trim();
      }

      await moderatorReviewCompliance(compliance.id, payload);

      setToast({
        isVisible: true,
        type: 'success',
        message: 'Revisión completada exitosamente',
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      setToast({
        isVisible: true,
        type: 'error',
        message: err.message || 'Error al revisar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDecision(null);
    setNotes('');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Revisión de Cumplimiento</h2>
              <p className="text-sm text-purple-100 mt-1">
                Revisa la evidencia y toma una decisión final
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Compliance Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <ComplianceTypeBadge type={compliance.complianceType} />
                <ComplianceStatusBadge status={compliance.status} />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Instrucciones Originales:
                </h3>
                <p className="text-sm text-gray-600">
                  {compliance.moderatorInstructions}
                </p>
              </div>
            </div>

            {/* Peer Review Indicator */}
            {compliance.peerApproved !== null && (
              <div className={`mb-6 p-4 rounded-lg border ${compliance.peerApproved ? 'bg-teal-50 border-teal-300' : 'bg-orange-50 border-orange-300'}`}>
                <h4 className="text-sm font-semibold mb-2 ${compliance.peerApproved ? 'text-teal-800' : 'text-orange-800'}">
                  {compliance.peerApproved ? '✅ Pre-aprobado por la otra parte' : '⚠️ Objetado por la otra parte'}
                </h4>
                {compliance.peerObjection && (
                  <p className="text-sm text-gray-700">
                    <strong>Motivo:</strong> {compliance.peerObjection}
                  </p>
                )}
              </div>
            )}

            {/* Evidence */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Evidencia Presentada:
              </h4>

              {compliance.evidenceUrls && compliance.evidenceUrls.length > 0 && (
                <div className="space-y-2 mb-4">
                  {compliance.evidenceUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                    >
                      <span className="text-sm font-medium text-blue-700">
                        📄 Archivo {idx + 1}
                      </span>
                      <ExternalLink size={16} className="text-blue-600 group-hover:text-blue-700" />
                    </a>
                  ))}
                </div>
              )}

              {compliance.userNotes && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="text-xs font-semibold text-gray-600 mb-2">
                    Notas del Usuario:
                  </h5>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {compliance.userNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Decision Input */}
            {decision && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {decision === 'approve' ? 'Notas (opcional)' : decision === 'reject' ? 'Motivo del rechazo *' : 'Instrucciones de ajuste *'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    decision === 'approve' 
                      ? 'Agrega comentarios si lo deseas...'
                      : decision === 'reject'
                      ? 'Explica por qué rechazas el cumplimiento...'
                      : 'Indica qué debe corregir o complementar...'
                  }
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            {!decision ? (
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setDecision('approve')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={18} />
                  Aprobar
                </button>

                <button
                  onClick={() => setDecision('reject')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <XCircle size={18} />
                  Rechazar
                </button>

                <button
                  onClick={() => setDecision('adjust')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  <Edit size={18} />
                  Ajustar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setDecision(null);
                    setNotes('');
                  }}
                  disabled={isSubmitting}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cambiar Decisión
                </button>
                <button
                  onClick={() => handleDecision(decision)}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Confirmar Decisión'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toast.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}
    </>
  );
};

export default ModeratorReviewModal;
