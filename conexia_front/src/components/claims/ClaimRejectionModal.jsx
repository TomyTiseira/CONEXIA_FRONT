/**
 * ClaimRejectionModal Component
 * Modal para que admin/moderador rechace un reclamo
 * Versión simplificada sin campos de compliances
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, XCircle, Loader2 } from 'lucide-react';
import { getClaimDetail, resolveClaim } from '@/service/claims';
import { CLAIM_VALIDATION, getClaimTypeLabel } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';

export const ClaimRejectionModal = ({ isOpen, onClose, claim, onSuccess, showToast }) => {
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const baseClaimId = claim?.claim?.id || claim?.id;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !baseClaimId) return;

      if (claim?.claim && claim?.claimant && claim?.otherUser) {
        setDetail(claim);
        return;
      }

      try {
        setIsLoadingDetail(true);
        const result = await getClaimDetail(baseClaimId);
        setDetail(result);
      } catch (err) {
        console.error('Error fetching claim detail for rejection modal:', err);
        setDetail(null);
      } finally {
        setIsLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [isOpen, baseClaimId, claim]);

  const normalized = useMemo(() => {
    const claimData = detail?.claim ? detail : (claim?.claim ? claim : null);
    const claimObj = claimData?.claim || claim || null;

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

    const claimantName = claimData?.claimant?.profile
      ? displayFromProfile(claimData.claimant.profile)
      : (claimObj?.claimantFirstName && claimObj?.claimantLastName)
        ? `${claimObj.claimantFirstName} ${claimObj.claimantLastName}`
        : claimObj?.claimantName || 'N/A';

    const claimedName = claimData?.otherUser?.profile
      ? displayFromProfile(claimData.otherUser.profile)
      : (claimObj?.claimedUserFirstName && claimObj?.claimedUserLastName)
        ? `${claimObj.claimedUserFirstName} ${claimObj.claimedUserLastName}`
        : claimObj?.claimedUserName || 'N/A';

    const serviceTitle =
      claimData?.hiring?.service?.title ||
      claimObj?.hiring?.service?.title ||
      claimObj?.hiring?.serviceTitle ||
      'N/A';

    const description = claimData?.claim?.description || claimObj?.description || '';
    const evidenceUrls = claimData?.claim?.evidenceUrls || claimObj?.evidenceUrls || [];
    const currentStatus = claimData?.claim?.status || claimObj?.status || '';

    const claimType = claimData?.claim?.claimType || claimObj?.claimType;
    const otherReason = claimData?.claim?.otherReason || claimObj?.otherReason;
    const baseTypeLabel = claimObj?.claimTypeLabel || getClaimTypeLabel(claimType) || claimType;
    
    const isOtherType = claimType === 'client_other' || claimType === 'provider_other';
    const claimTypeLabel = isOtherType && otherReason
      ? `Otro (${otherReason})`
      : baseTypeLabel;

    return {
      claimId: baseClaimId,
      claimantName,
      claimedName,
      serviceTitle,
      description,
      evidenceUrls,
      status: currentStatus,
      claimType,
      claimTypeLabel,
    };
  }, [detail, claim, baseClaimId]);

  useEffect(() => {
    if (!isOpen) {
      setResolution('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedResolution = resolution.trim();

    if (trimmedResolution.length < CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH) {
      setError(`La resolución debe tener al menos ${CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH} caracteres`);
      return;
    }

    if (trimmedResolution.length > CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH) {
      setError(`La resolución no puede exceder ${CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const rejectionData = {
        status: 'rejected',
        resolution: trimmedResolution,
      };

      const updatedClaim = await resolveClaim(normalized.claimId, rejectionData);

      // Cerrar modal inmediatamente
      handleClose();

      // Mostrar toast en la página padre
      if (showToast) {
        showToast('success', 'Reclamo rechazado. La contratación vuelve a su estado anterior.');
      }

      // Actualizar claim en el padre
      if (onSuccess) {
        onSuccess(updatedClaim);
      }
    } catch (err) {
      console.error('Error rejecting claim:', err);
      
      // Mostrar error en la página padre
      if (showToast) {
        showToast('error', err.message || 'Error al procesar el rechazo. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setResolution('');
      setError(null);
    }
  };

  const characterCount = resolution.trim().length;
  const minLength = CLAIM_VALIDATION.RESOLUTION_MIN_LENGTH;
  const maxLength = CLAIM_VALIDATION.RESOLUTION_MAX_LENGTH;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              Rechazar reclamo
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form envuelve content y footer */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* Content (solo esta sección hace scroll) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
              <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold text-lg text-gray-900">Información del reclamo</h3>
                  {isLoadingDetail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 size={16} className="animate-spin" />
                      Cargando detalle...
                    </div>
                  )}
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tipo de reclamo</p>
                    <ClaimTypeBadge
                      claimType={normalized.claimType}
                      labelOverride={normalized.claimTypeLabel}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    <ClaimStatusBadge status={normalized.status} />
                  </div>
                  <p className="text-gray-700">
                    <span className="font-medium">Reclamante:</span>{' '}
                    {normalized.claimantName}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Reclamado:</span>{' '}
                    {normalized.claimedName}
                  </p>
                  <p className="text-gray-700 md:col-span-2">
                    <span className="font-medium">Servicio:</span> {normalized.serviceTitle}
                  </p>
                </div>
              </div>

              {/* Descripción del Reclamo */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Descripción del reclamo</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {normalized.description || 'No hay descripción disponible'}
                </p>
              </div>

              {/* Evidencias actuales */}
              {normalized.evidenceUrls?.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Evidencias del reclamo</h3>
                  <ClaimEvidenceViewer evidenceUrls={normalized.evidenceUrls} />
                </div>
              )}

              {/* Advertencia para rechazo */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">¿Qué sucede al rechazar el reclamo?</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>El reclamo se marcará como &quot;rechazado&quot;</li>
                  <li>La contratación volverá a su estado anterior</li>
                  <li>Ambas partes recibirán un email con el motivo del rechazo</li>
                </ul>
              </div>

              {/* Campo de resolución/explicación */}
              <div className="bg-white border rounded-lg p-4">
                <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo del rechazo <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={8}
                  name="resolution"
                  placeholder="Explica por qué se rechaza el reclamo. Sé específico y profesional..."
                  value={resolution}
                  onChange={(e) => {
                    setResolution(e.target.value);
                    setError(null);
                  }}
                  maxLength={maxLength}
                  disabled={isSubmitting}
                  showCharCount={true}
                  error={error}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {minLength} caracteres
                </p>
              </div>
            </div>

            {/* Footer (estático) */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-xl">
              <Button type="button" onClick={onClose} disabled={isSubmitting} variant="cancel">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                variant="danger"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    Rechazar reclamo
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

export default ClaimRejectionModal;
