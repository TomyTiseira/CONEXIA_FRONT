'use client';

import { useState, useEffect } from 'react';
import { updateClaim } from '@/service/claims';
import { CLAIM_VALIDATION, CLAIM_ERROR_MESSAGES } from '@/constants/claims';
import { config } from '@/config';
import InputField from '@/components/form/InputField';
import { ClaimEvidenceUpload } from './ClaimEvidenceUpload';
import { useEvidenceUpload } from '@/hooks/claims';

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
  const [clarificationResponse, setClarificationResponse] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Usar el hook de evidencias igual que en ClaimModal
  const {
    files,
    errors: uploadErrors,
    addFiles,
    removeFile,
    reset: resetUpload,
  } = useEvidenceUpload();

  // Calcular cuántos archivos se pueden agregar
  const existingFilesCount = claim.evidenceUrls?.length || 0;
  const maxNewFiles = CLAIM_VALIDATION.MAX_EVIDENCE_FILES - existingFilesCount;
  const canAddMoreFiles = existingFilesCount < CLAIM_VALIDATION.MAX_EVIDENCE_FILES;

  // Reset cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setClarificationResponse('');
      resetUpload();
      setShowValidationError(false);
      setUploadError('');
    }
  }, [isOpen, resetUpload]);

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
   * Maneja el cambio de archivos - permite agregar uno a uno
   */
  const handleAddFiles = (selectedFiles) => {
    setUploadError('');
    
    // Validar que no se exceda el límite total
    const totalFiles = existingFilesCount + files.length + selectedFiles.length;
    if (totalFiles > CLAIM_VALIDATION.MAX_EVIDENCE_FILES) {
      const filesRemaining = maxNewFiles - files.length;
      setUploadError(`Solo puedes agregar ${filesRemaining} archivo(s) más. Ya tienes ${existingFilesCount} archivo(s) existente(s) y ${files.length} archivo(s) nuevo(s) seleccionado(s).`);
      return false;
    }

    // Usar el hook de evidencias que ya valida tamaño y formato
    const result = addFiles(selectedFiles);
    return result;
  };

  /**
   * Valida y envía el formulario
   */
  const handleConfirm = async () => {
    // Validar que la respuesta sea obligatoria y tenga al menos 50 caracteres
    const trimmedResponse = clarificationResponse.trim();
    
    if (trimmedResponse.length === 0) {
      setShowValidationError(true);
      return;
    }

    if (trimmedResponse.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH) {
      setShowValidationError(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Agregar respuesta de subsanación (obligatoria)
      formData.append('clarificationResponse', trimmedResponse);

      // Agregar archivos nuevos si se proporcionaron (opcional)
      if (files.length > 0) {
        files.forEach((file) => {
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
    setClarificationResponse('');
    resetUpload();
    setShowValidationError(false);
    setUploadError('');
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Estático */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Subsanar Reclamo</h2>
        </div>

        {/* Body - Con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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

          {/* Respuesta de Subsanación (obligatoria) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta a las observaciones <span className="text-red-500">*</span>
            </label>
            <InputField
              multiline
              rows={6}
              name="clarificationResponse"
              placeholder="Proporciona la información adicional solicitada por el moderador..."
              value={clarificationResponse}
              onChange={(e) => {
                setClarificationResponse(e.target.value);
                setShowValidationError(false);
              }}
              maxLength={CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH}
              disabled={isSubmitting}
              showCharCount={true}
              error={showValidationError && clarificationResponse.trim().length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH ? CLAIM_ERROR_MESSAGES.DESCRIPTION_MIN_LENGTH : ''}
            />
            <p className="mt-1 text-xs text-gray-600">
              Mínimo {CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH} caracteres
            </p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agregar Nuevas Evidencias (opcional)
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Archivos actuales: {existingFilesCount}. Puedes agregar hasta {maxNewFiles - files.length} archivo(s) más.
              </p>
              <ClaimEvidenceUpload
                files={files}
                onAddFiles={handleAddFiles}
                onRemoveFile={removeFile}
                errors={uploadErrors}
                maxFiles={maxNewFiles}
                existingFilesCount={existingFilesCount}
              />
              {/* Error de límite de archivos */}
              {uploadError && (
                <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">• {uploadError}</p>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de validación general - eliminado, ahora se muestra en InputField */}
        </div>

        {/* Footer - Estático */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || clarificationResponse.trim().length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH}
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
