/**
 * ClaimResolutionModal Component
 * Modal para que admin/moderador resuelva un reclamo
 */

'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { validateResolution } from '@/utils/claimValidation';
import { resolveClaim } from '@/service/claims';
import { CLAIM_STATUS } from '@/constants/claims';
import Toast from '@/components/ui/Toast';

export const ClaimResolutionModal = ({ isOpen, onClose, claim, token, onSuccess }) => {
  const [decision, setDecision] = useState('resolved'); // 'resolved' o 'rejected'
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar resolución
    const validationError = validateResolution(resolution);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const resolutionData = {
        status: decision,
        resolution: resolution.trim(),
      };

      const resolvedClaim = await resolveClaim(claim.id, resolutionData, token);

      // Éxito
      const message =
        decision === 'resolved'
          ? 'Reclamo resuelto exitosamente. Se ha notificado a ambas partes.'
          : 'Reclamo rechazado. Se ha notificado a ambas partes.';

      setToast({ isVisible: true, type: 'success', message });

      if (onSuccess) {
        onSuccess(resolvedClaim);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error resolving claim:', error);
      setToast({ isVisible: true, type: 'error', message: error.message || 'Error al procesar la resolución' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = resolution.trim().length;
  const minLength = 20;
  const maxLength = 2000;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Resolver Reclamo</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info del reclamo */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reclamo:</span> {claim.claimType}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Reclamante:</span> {claim.claimantRole}
              </p>
            </div>

            {/* Decisión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Decisión <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {/* Resolver */}
                <label
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    decision === 'resolved'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="resolved"
                    checked={decision === 'resolved'}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      <span className="font-semibold text-gray-900">
                        Resolver a favor del reclamante
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">El reclamo es válido</p>
                  </div>
                </label>

                {/* Rechazar */}
                <label
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    decision === 'rejected'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={decision === 'rejected'}
                    onChange={(e) => setDecision(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <XCircle size={20} className="text-red-600" />
                      <span className="font-semibold text-gray-900">Rechazar el reclamo</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">El reclamo no es válido</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Resolución */}
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                Explicación de la decisión <span className="text-red-500">*</span>
              </label>
              <textarea
                id="resolution"
                rows={6}
                value={resolution}
                onChange={(e) => {
                  setResolution(e.target.value);
                  setError(null);
                }}
                placeholder="Explica la decisión tomada y las acciones a seguir..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />

              {/* Character Counter */}
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`text-sm ${
                    isValid
                      ? 'text-green-600'
                      : characterCount < minLength
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {characterCount}/{maxLength} caracteres
                  {characterCount < minLength && ` (faltan ${minLength - characterCount})`}
                </span>
              </div>

              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Resolución'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        position="top-center"
      />
    </div>
  );
};

export default ClaimResolutionModal;
