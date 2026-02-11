'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getClaimDetail, updateClaim } from '@/service/claims';
import { CLAIM_VALIDATION, CLAIM_ERROR_MESSAGES, getClaimTypeLabel } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import { ClaimEvidenceUpload } from './ClaimEvidenceUpload';
import { useEvidenceUpload } from '@/hooks/claims';
import Button from '@/components/ui/Button';
import { ClaimEvidenceViewer } from '@/components/claims/ClaimEvidenceViewer';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';

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
  const MAX_SUBSANAR_EVIDENCE_FILES = 5;

  const [clarificationResponse, setClarificationResponse] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Usar el hook de evidencias igual que en ClaimModal
  const {
    files,
    errors: uploadErrors,
    addFiles,
    removeFile,
    reset: resetUpload,
  } = useEvidenceUpload();

  const baseClaimId = claim?.claim?.id || claim?.id;

  const normalizeDetail = (rawDetail) => {
    if (!rawDetail) return rawDetail;
    if (rawDetail.claimant && rawDetail.otherUser) return rawDetail;

    const userRole = rawDetail?.claim?.userRole;
    if (userRole && rawDetail?.yourProfile && rawDetail?.otherUserProfile) {
      return {
        ...rawDetail,
        claimant: userRole === 'claimant' ? rawDetail.yourProfile : rawDetail.otherUserProfile,
        otherUser: userRole === 'claimant' ? rawDetail.otherUserProfile : rawDetail.yourProfile,
      };
    }

    return rawDetail;
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !baseClaimId) return;

      if (claim?.claim && claim?.claimant && claim?.otherUser) {
        setDetail(normalizeDetail(claim));
        return;
      }

      try {
        setIsLoadingDetail(true);
        const result = await getClaimDetail(baseClaimId);
        setDetail(normalizeDetail(result));
      } catch (err) {
        console.error('Error fetching claim detail for subsanar modal:', err);
        setDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [isOpen, baseClaimId, claim]);

  const claimObj = useMemo(() => {
    return detail?.claim || claim?.claim || claim || {};
  }, [detail, claim]);

  const claimTypeLabel = useMemo(() => {
    const type = claimObj?.claimType;
    const otherReason = claimObj?.otherReason;
    const base = claimObj?.claimTypeLabel || getClaimTypeLabel(type) || type || 'N/A';
    return otherReason && String(base).toLowerCase() === 'otro' ? `Otro (${otherReason})` : base;
  }, [claimObj]);

  const serviceTitle = useMemo(() => {
    return detail?.hiring?.service?.title || claimObj?.hiring?.service?.title || claimObj?.hiring?.serviceTitle || 'N/A';
  }, [detail, claimObj]);

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    const trimmed = String(fullName).trim();
    if (!trimmed) return '';
    return trimmed.split(/\s+/)[0] || '';
  };

  const displayFromProfile = (profile) => {
    if (!profile) return 'N/A';
    const firstName = getFirstName(profile.name);
    const lastName = profile.lastName ? String(profile.lastName).trim() : '';
    return `${firstName} ${lastName}`.trim() || profile.name || 'N/A';
  };

  const claimantName = useMemo(() => {
    const profile = detail?.claimant?.profile || detail?.claimant || null;
    if (profile) return displayFromProfile(profile);

    // Fallback (cuando se abre desde Mis reclamos sin detalle): otherUser es la contraparte
    if (claimObj?.otherUser && claimObj?.userRole === 'respondent') {
      return displayFromProfile({ name: claimObj.otherUser.name, lastName: claimObj.otherUser.lastName });
    }

    return claimObj?.claimantName || 'N/A';
  }, [detail, claimObj]);

  const claimedName = useMemo(() => {
    const profile = detail?.otherUser?.profile || detail?.otherUser || null;
    if (profile) return displayFromProfile(profile);

    // Fallback (cuando se abre desde Mis reclamos sin detalle): otherUser es la contraparte
    if (claimObj?.otherUser && claimObj?.userRole === 'claimant') {
      return displayFromProfile({ name: claimObj.otherUser.name, lastName: claimObj.otherUser.lastName });
    }

    return claimObj?.claimedUserName || 'N/A';
  }, [detail, claimObj]);

  const trimmedResponse = clarificationResponse.trim();
  const hasText = trimmedResponse.length > 0;
  const hasFiles = files.length > 0;
  const isTextValid = !hasText || trimmedResponse.length >= CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH;
  const canSubmit = !isSubmitting && isTextValid && (hasText || hasFiles);

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
   * Maneja el cambio de archivos - permite agregar uno a uno
   */
  const handleAddFiles = (selectedFiles) => {
    setUploadError('');
    
    // Validar que no se exceda el límite total
    const totalSelected = files.length + selectedFiles.length;
    if (totalSelected > MAX_SUBSANAR_EVIDENCE_FILES) {
      const filesRemaining = MAX_SUBSANAR_EVIDENCE_FILES - files.length;
      setUploadError(`Solo puedes agregar ${filesRemaining} archivo(s) más. Máximo ${MAX_SUBSANAR_EVIDENCE_FILES} en total para la subsanación.`);
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
    setUploadError('');
    setShowValidationError(false);

    // Regla: debe venir al menos uno (respuesta o archivos)
    if (!hasText && !hasFiles) {
      setShowValidationError(true);
      setUploadError('Debes ingresar una respuesta o adjuntar al menos un archivo de evidencia.');
      return;
    }

    // Si hay texto, debe cumplir mínimo
    if (hasText && trimmedResponse.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH) {
      setShowValidationError(true);
      return;
    }

    // Archivos: máximo 5
    if (files.length > MAX_SUBSANAR_EVIDENCE_FILES) {
      setUploadError(`No puedes subir más de ${MAX_SUBSANAR_EVIDENCE_FILES} archivos en la subsanación.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Agregar respuesta de subsanación (opcional)
      if (hasText) {
        formData.append('clarificationResponse', trimmedResponse);
      }

      // Agregar archivos nuevos si se proporcionaron (opcional)
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('evidence', file);
        });
      }

      // Enviar al backend
      const result = await updateClaim(claimObj.id, formData);

      // Resetear formulario
      resetForm();
      
      // Cerrar modal primero
      onClose();
      
      // Mostrar toast después de cerrar
      if (showToast) {
        showToast('success', 'Subsanación enviada. El equipo de soporte lo revisará nuevamente.');
      }
      
      // Actualizar la tabla
      if (onSuccess) {
        onSuccess(result);
      }
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
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">Subsanar reclamo</h2>
              {isLoadingDetail && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 size={16} className="animate-spin" />
                  Cargando detalle...
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body - Con scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
            {/* Información del Reclamo */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-3">Información del reclamo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tipo de reclamo</p>
                  <ClaimTypeBadge
                    claimType={claimObj.claimType}
                    labelOverride={claimTypeLabel}
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Estado</p>
                  <ClaimStatusBadge status={claimObj.status} />
                </div>
                <p className="text-gray-700">
                  <span className="font-medium">Reclamante:</span> {claimantName}{' '}
                  {claimObj?.claimantRole
                    ? `(${claimObj.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})`
                    : ''}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Reclamado:</span> {claimedName}{' '}
                  {claimObj?.claimantRole
                    ? `(${claimObj.claimantRole === 'client' ? 'Proveedor' : 'Cliente'})`
                    : ''}
                </p>
                <p className="text-gray-700 md:col-span-2">
                  <span className="font-medium">Servicio:</span> {serviceTitle}
                </p>
                <p className="text-gray-700 md:col-span-2">
                  <span className="font-medium">Fecha de creación:</span> {formatDate(claimObj.createdAt)}
                </p>
              </div>
            </div>

            {/* Descripción del Reclamo */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Descripción del reclamo</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {claimObj.description || 'No hay descripción disponible'}
              </p>
            </div>

            {/* Evidencias actuales */}
            {claimObj.evidenceUrls?.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Evidencias</h3>
                <ClaimEvidenceViewer evidenceUrls={claimObj.evidenceUrls} />
              </div>
            )}

            {/* Observaciones del Moderador (naranja) */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0"
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
                  <h3 className="font-semibold text-orange-900 mb-2">Observaciones del Moderador</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {claimObj.observations || 'No hay observaciones disponibles'}
                  </p>
                  {claimObj.observationsAt && (
                    <p className="text-sm text-gray-600 mt-2">El {formatDate(claimObj.observationsAt)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Respuesta a observaciones */}
            <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta a las observaciones (opcional)
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
                setUploadError('');
              }}
              maxLength={CLAIM_VALIDATION.DESCRIPTION_MAX_LENGTH}
              disabled={isSubmitting}
              showCharCount={true}
              error={showValidationError && hasText && trimmedResponse.length < CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH ? CLAIM_ERROR_MESSAGES.DESCRIPTION_MIN_LENGTH : ''}
            />
            <p className="mt-1 text-xs text-gray-600">
              Si ingresas texto, mínimo {CLAIM_VALIDATION.DESCRIPTION_MIN_LENGTH} caracteres. También puedes adjuntar evidencias sin texto.
            </p>
          </div>

          {/* Nuevas Evidencias (opcional) */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agregar evidencias (opcional)
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Puedes adjuntar hasta {MAX_SUBSANAR_EVIDENCE_FILES} archivo(s) en esta subsanación.
            </p>
            <ClaimEvidenceUpload
              files={files}
              onAddFiles={handleAddFiles}
              onRemoveFile={removeFile}
              errors={uploadErrors}
              maxFiles={MAX_SUBSANAR_EVIDENCE_FILES}
              existingFilesCount={0}
            />
            {/* Error de límite de archivos / regla general */}
            {uploadError && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">• {uploadError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Estático */}
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
            <Button onClick={handleClose} disabled={isSubmitting} variant="cancel">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!canSubmit}
              variant="warning"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
