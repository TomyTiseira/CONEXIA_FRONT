/**
 * PeerReviewPanel Component
 * Panel para que la otra parte revise y apruebe/objete la evidencia
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, SkipForward, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { usePeerReview } from '@/hooks/compliances';
import { ComplianceTypeBadge } from './ComplianceTypeBadge';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import Toast from '@/components/ui/Toast';

export const PeerReviewPanel = ({ 
  compliance, 
  userId,
  onSuccess,
  onSkip,
  className = '' 
}) => {
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });
  
  const {
    isReviewing,
    error,
    showObjectionInput,
    objection,
    approve,
    object,
    toggleObjectionInput,
    updateObjection,
    getObjectionCharacterCount,
  } = usePeerReview();

  if (!compliance) return null;

  const handleApprove = async () => {
    try {
      await approve(compliance.id, userId);
      
      setToast({
        isVisible: true,
        type: 'success',
        message: 'Pre-aprobaste la evidencia. El moderador será notificado.',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setToast({
        isVisible: true,
        type: 'error',
        message: err.message || 'Error al aprobar',
      });
    }
  };

  const handleObject = async () => {
    try {
      await object(compliance.id, userId, objection);
      
      setToast({
        isVisible: true,
        type: 'success',
        message: 'Objeción enviada al moderador.',
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      setToast({
        isVisible: true,
        type: 'error',
        message: err.message || 'Error al objetar',
      });
    }
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
  };

  const characterCount = getObjectionCharacterCount();

  return (
    <>
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Revisar evidencia de cumplimiento
          </h3>
          <p className="text-sm text-gray-600">
            Puedes pre-aprobar u objetar la evidencia antes de que el moderador la revise.
            Tu opinión será considerada en la decisión final.
          </p>
        </div>

        {/* Compliance Info */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <ComplianceTypeBadge type={compliance.complianceType} />
            <ComplianceStatusBadge status={compliance.status} />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Instrucciones del Moderador:
            </h4>
            <p className="text-sm text-gray-600">
              {compliance.moderatorInstructions}
            </p>
          </div>
        </div>

        {/* Evidence Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Evidencia Subida:
          </h4>

          {/* Files */}
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

          {/* User Notes */}
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center text-red-700">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        {!showObjectionInput ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Approve */}
            <button
              onClick={handleApprove}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReviewing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Aprobar</span>
                </>
              )}
            </button>

            {/* Object */}
            <button
              onClick={toggleObjectionInput}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              <span>Objetar</span>
            </button>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={isReviewing}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              <SkipForward size={18} />
              <span>Omitir</span>
            </button>
          </div>
        ) : (
          /* Objection Input */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Explica por qué no cumple con lo solicitado *
              </label>
              <textarea
                value={objection}
                onChange={(e) => updateObjection(e.target.value)}
                placeholder="Describe específicamente qué falta o qué está incorrecto..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Mínimo 20 caracteres</span>
                <span className={characterCount.isValid ? 'text-green-600' : 'text-gray-500'}>
                  {characterCount.current} / {characterCount.max}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleObject}
                disabled={isReviewing || !characterCount.isValid}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReviewing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span>Enviar Objeción</span>
                  </>
                )}
              </button>

              <button
                onClick={toggleObjectionInput}
                disabled={isReviewing}
                className="px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Info Message */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          <strong>💡 Nota:</strong> Tu revisión es informativa. El moderador tomará la decisión final
          considerando tu opinión.
        </div>
      </div>

      {/* Toast */}
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

export default PeerReviewPanel;
