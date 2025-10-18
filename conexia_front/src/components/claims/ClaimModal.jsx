/**
 * ClaimModal Component
 * Modal para crear un nuevo reclamo
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { useClaimForm, useEvidenceUpload } from '@/hooks/claims';
import { createClaim } from '@/service/claims';
import { ClaimEvidenceUpload } from './ClaimEvidenceUpload';
import {
  CLIENT_CLAIM_TYPE_LABELS,
  PROVIDER_CLAIM_TYPE_LABELS,
  CLAIM_VALIDATION,
} from '@/constants/claims';
import Toast from '@/components/ui/Toast';

export const ClaimModal = ({ isOpen, onClose, hiringId, isClient, token, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });

  const {
    formData,
    errors,
    touched,
    setField,
    setFieldTouched,
    validateForm,
    getCharacterCount,
    reset: resetForm,
  } = useClaimForm(isClient);

  const {
    files,
    errors: uploadErrors,
    addFiles,
    removeFile,
    reset: resetUpload,
  } = useEvidenceUpload();

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      resetForm();
      resetUpload();
    }
  }, [isOpen, resetForm, resetUpload]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario
    const isValid = validateForm();
    if (!isValid) {
      setToast({ isVisible: true, type: 'error', message: 'Por favor completa todos los campos requeridos' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear el reclamo con archivos adjuntos (todo en un solo request)
      const claimData = {
        hiringId: parseInt(hiringId),
        claimType: formData.claimType,
        description: formData.description.trim(),
        files: files, // Enviar archivos directamente
      };

      const createdClaim = await createClaim(claimData);

      // Éxito
      setToast({ isVisible: true, type: 'success', message: 'Reclamo creado exitosamente. Ambas partes han sido notificadas.' });
      
      if (onSuccess) {
        onSuccess(createdClaim);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error creating claim:', error);
      setToast({ isVisible: true, type: 'error', message: error.message || 'Error al crear el reclamo' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const characterCount = getCharacterCount();
  const claimTypeLabels = isClient ? CLIENT_CLAIM_TYPE_LABELS : PROVIDER_CLAIM_TYPE_LABELS;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Realizar Reclamo</h2>
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
            {/* Advertencia */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-1">IMPORTANTE</p>
                  <p className="text-sm text-yellow-700">
                    Al crear un reclamo, el servicio y los pagos quedarán congelados hasta que un
                    moderador lo resuelva. Ambas partes serán notificadas por email.
                  </p>
                </div>
              </div>
            </div>

            {/* Tipo de Reclamo */}
            <div>
              <label htmlFor="claimType" className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del reclamo <span className="text-red-500">*</span>
              </label>
              <select
                id="claimType"
                value={formData.claimType}
                onChange={(e) => setField('claimType', e.target.value)}
                onBlur={() => setFieldTouched('claimType')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  touched.claimType && errors.claimType ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un motivo...</option>
                {Object.entries(claimTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {touched.claimType && errors.claimType && (
                <p className="mt-1 text-sm text-red-600">{errors.claimType}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción detallada del problema <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => setField('description', e.target.value)}
                onBlur={() => setFieldTouched('description')}
                placeholder="Explica con detalle la situación. Mínimo 50 caracteres..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none ${
                  touched.description && errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              
              {/* Character Counter */}
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`text-sm ${
                    characterCount.isValid
                      ? 'text-green-600'
                      : characterCount.isTooShort
                      ? 'text-red-600'
                      : 'text-orange-600'
                  }`}
                >
                  {characterCount.current}/{characterCount.max} caracteres
                  {characterCount.isTooShort &&
                    ` (faltan ${characterCount.min - characterCount.current})`}
                </span>
              </div>

              {touched.description && errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Evidencias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidencias (opcional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Puedes adjuntar hasta {CLAIM_VALIDATION.MAX_EVIDENCE_FILES} archivos para respaldar
                tu reclamo
              </p>
              <ClaimEvidenceUpload
                files={files}
                onAddFiles={addFiles}
                onRemoveFile={removeFile}
                errors={uploadErrors}
              />
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
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
              disabled={isSubmitting || !characterCount.isValid}
              className="px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creando reclamo...
                </>
              ) : (
                'Crear Reclamo'
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

export default ClaimModal;
