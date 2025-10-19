'use client';

import { useState } from 'react';
import { updateClaim } from '@/service/claims';
import { CLAIM_VALIDATION, CLAIM_ERROR_MESSAGES } from '@/constants/claims';
import { config } from '@/config/env';

/**
 * Modal para subsanar un reclamo cuando está en estado "pending_clarification"
 * Permite al denunciante actualizar la descripción y/o agregar nuevas evidencias
 */
export function SubsanarClaimModal({
  isOpen,
  onClose,
  claim,
  onSuccess,
  showToast,
}) {
  const [newDescription, setNewDescription] = useState('');
  const [newFiles, setNewFiles] = useState([]);
  const [showValidationError, setShowValidationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calcular cuántos archivos se pueden agregar
  const existingFilesCount = claim.evidenceUrls?.length || 0;
  const maxNewFiles = CLAIM_VALIDATION.MAX_EVIDENCE_FILES - existingFilesCount;
  const canAddMoreFiles = existingFilesCount < CLAIM_VALIDATION.MAX_EVIDENCE_FILES;

  /**
   * Formatea la fecha en formato legible
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  /**
   * Convierte URL relativa a absoluta
   */
  const getAbsoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${config.DOCUMENT_URL}${url}`;
  };

  /**
   * Verifica si el archivo es una imagen
   */
  const isImage = (url) => {
    const ext = url.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
  };

  /**
   * Obtiene el nombre del archivo desde la URL
   */
  const getFileName = (url) => {
    return url.split('/').pop();
  };

  /**
   * Maneja el cambio de archivos
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    // Validar cantidad de archivos
    if (files.length > maxNewFiles) {
      showToast('error', `Solo puedes agregar ${maxNewFiles} archivos más`);
      return;
    }

    // Validar tamaño de archivos
    const oversizedFiles = files.filter((file) => file.size > CLAIM_VALIDATION.MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      showToast('error', CLAIM_ERROR_MESSAGES.MAX_SIZE);
      return;
    }

    // Validar formato de archivos
    const invalidFiles = files.filter((file) => !CLAIM_VALIDATION.ALLOWED_FILE_TYPES.includes(file.type));
    if (invalidFiles.length > 0) {
      showToast('error', CLAIM_ERROR_MESSAGES.INVALID_FORMAT);
      return;
    }

    setNewFiles(files);
    setShowValidationError(false);
  };

  /**
   * Elimina un archivo de la lista
   */
  const removeFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /**
   * Valida y envía el formulario
   */
  const handleConfirm = async () => {
    // Validar que la descripción sea obligatoria y tenga al menos 50 caracteres
    const trimmedDescription = newDescription.trim();
    
    if (trimmedDescription.length === 0) {
      setShowValidationError(true);
      showToast('error', 'La descripción es obligatoria');
      return;
    }

    if (trimmedDescription.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH) {
      showToast('error', CLAIM_ERROR_MESSAGES.DESCRIPTION_MIN_LENGTH);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Agregar descripción (obligatoria)
      formData.append('description', trimmedDescription);

      // Agregar archivos si se proporcionaron (opcional)
      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          formData.append('evidence', file);
        });
      }

      // Enviar al backend
      await updateClaim(claim.id, formData);

      // Éxito
      showToast('success', 'Reclamo subsanado exitosamente. El equipo de soporte lo revisará nuevamente.');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error al subsanar reclamo:', error);
      showToast('error', error.message || 'Error al subsanar el reclamo. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Resetea el formulario
   */
  const resetForm = () => {
    setNewDescription('');
    setNewFiles([]);
    setShowValidationError(false);
  };

  /**
   * Maneja el cierre del modal
   */
  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Subsanar Reclamo</h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-6">
          {/* Observaciones del Moderador */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-blue-500 mr-3 mt-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Observaciones del Moderador</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{claim.observations}</p>
                <p className="text-sm text-gray-500 mt-2">
                  El {formatDate(claim.observationsAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Detalle del Reclamo (solo lectura) */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">Detalle del Reclamo</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Motivo:</span>{' '}
                <span className="font-medium">{claim.claimTypeLabel}</span>
              </div>
              <div>
                <span className="text-gray-600">Contratación:</span>{' '}
                <span className="font-medium">#{claim.hiringId}</span>
              </div>
              <div>
                <span className="text-gray-600">Fecha de creación:</span>{' '}
                <span className="font-medium">{formatDate(claim.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Descripción Original (referencia) */}
          <div className="text-sm">
            <label className="text-gray-600 mb-1 block font-medium">Descripción actual:</label>
            <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 max-h-24 overflow-y-auto whitespace-pre-wrap">
              {claim.description}
            </p>
          </div>

          {/* Nueva Descripción (obligatoria) */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Nueva Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => {
                setNewDescription(e.target.value);
                setShowValidationError(false);
              }}
              placeholder="Actualiza la descripción de tu reclamo proporcionando la información solicitada por el moderador..."
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
              maxLength={CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH}
              disabled={isSubmitting}
              required
            />
            <div className="flex justify-between mt-1">
              <span className={`text-sm ${newDescription.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                {newDescription.length > 0
                  ? `${newDescription.length}/${CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH} caracteres${newDescription.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH ? ` (mínimo ${CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH})` : ''}`
                  : `Mínimo ${CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH} caracteres (obligatorio)`}
              </span>
            </div>
          </div>

          {/* Evidencias Actuales */}
          {claim.evidenceUrls && claim.evidenceUrls.length > 0 && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Evidencias actuales ({claim.evidenceUrls.length}/{CLAIM_VALIDATION.MAX_EVIDENCE_FILES})
              </label>
              <div className="grid grid-cols-3 gap-3">
                {claim.evidenceUrls.map((url, index) => {
                  const absoluteUrl = getAbsoluteUrl(url);
                  return (
                    <div key={index} className="relative group">
                      {isImage(url) ? (
                        <img
                          src={absoluteUrl}
                          alt={`Evidencia ${index + 1}`}
                          className="w-full h-24 object-cover rounded border border-gray-300"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="text-xs text-gray-500 mt-1">{getFileName(url)}</span>
                        </div>
                      )}
                      <a
                        href={absoluteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 rounded"
                      >
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nuevas Evidencias (opcional) */}
          {canAddMoreFiles && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Agregar Nuevas Evidencias (opcional)
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Archivos actuales: {existingFilesCount}. Puedes agregar hasta {maxNewFiles} archivos
                más.
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.mp4"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100 file:cursor-pointer
                  cursor-pointer hover:cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Formatos: JPG, PNG, GIF, PDF, DOCX, MP4 (máx. 10MB cada uno)
              </p>
              {newFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {newFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded border border-gray-200"
                    >
                      <span className="truncate flex-1">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 ml-2 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensaje de validación */}
          {showValidationError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm text-red-700">
                ⚠️ La descripción es obligatoria y debe tener al menos {CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH} caracteres
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
