/**
 * ClaimResolutionModal Component
 * Modal para que admin/moderador resuelva o rechace un reclamo
 * Incluye 3 tipos de resolución: A favor del cliente, A favor del proveedor, Acuerdo parcial
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle, XCircle, Loader2, User, Briefcase, HandshakeIcon } from 'lucide-react';
import { getClaimDetail, resolveClaim } from '@/service/claims';
import { CLAIM_VALIDATION, CLAIM_RESOLUTION_TYPES, CLAIM_RESOLUTION_CONFIG, getClaimTypeLabel } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';

export const ClaimResolutionModal = ({ isOpen, onClose, claim, onSuccess, showToast }) => {
  const [action, setAction] = useState('resolve');
  const [resolutionType, setResolutionType] = useState(CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR);
  const [resolution, setResolution] = useState('');
  const [partialAgreementDetails, setPartialAgreementDetails] = useState('');
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
        console.error('Error fetching claim detail for resolution modal:', err);
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
    
    // Verificar si es tipo "Otro" (client_other o provider_other)
    const isOtherType = claimType === 'client_other' || claimType === 'provider_other';
    const claimTypeLabel = isOtherType && otherReason
      ? (String(baseTypeLabel).includes('(especificar)')
        ? String(baseTypeLabel).replace('(especificar)', `(${otherReason})`)
        : `Otro (${otherReason})`)
      : baseTypeLabel;

    return {
      claimId: claimObj?.id,
      claimType,
      claimTypeLabel,
      claimantName,
      claimedName,
      claimantRole: claimObj?.claimantRole,
      serviceTitle,
      description,
      evidenceUrls,
      status: currentStatus,
    };
  }, [claim, detail]);

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

    if (
      action === 'resolve' &&
      resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT &&
      partialAgreementDetails.trim().length > CLAIM_VALIDATION.PARTIAL_AGREEMENT_MAX_LENGTH
    ) {
      setError(`Los detalles del acuerdo no pueden exceder ${CLAIM_VALIDATION.PARTIAL_AGREEMENT_MAX_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resolutionData = {
        status: action === 'resolve' ? 'resolved' : 'rejected',
        resolution: trimmedResolution,
      };

      if (action === 'resolve') {
        resolutionData.resolutionType = resolutionType;
      }

      if (action === 'resolve' && resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT && partialAgreementDetails.trim()) {
        resolutionData.partialAgreementDetails = partialAgreementDetails.trim();
      }

      const updatedClaim = await resolveClaim(normalized.claimId, resolutionData);

      // Cerrar modal inmediatamente
      handleClose();

      // Mostrar toast en la página padre
      const message =
        action === 'resolve'
          ? 'Reclamo resuelto exitosamente. Las partes serán notificadas.'
          : 'Reclamo rechazado. La contratación vuelve a su estado anterior.';

      if (showToast) {
        showToast('success', message);
      }

      // Actualizar claim en el padre
      if (onSuccess) {
        onSuccess(updatedClaim);
      }
    } catch (err) {
      console.error('Error resolving claim:', err);
      
      // Mostrar error en la página padre
      if (showToast) {
        showToast('error', err.message || 'Error al procesar la resolución. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setAction('resolve');
      setResolutionType(CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR);
      setResolution('');
      setPartialAgreementDetails('');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {action === 'resolve' ? 'Resolver reclamo' : 'Rechazar reclamo'}
            </h2>
            <button
              onClick={handleClose}
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
                  <p className="text-sm text-gray-600 mb-1">Tipo de Reclamo</p>
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
                  {normalized.claimantName}{' '}
                  {normalized.claimantRole
                    ? `(${normalized.claimantRole === 'client' ? 'Cliente' : 'Proveedor'})`
                    : ''}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Reclamado:</span>{' '}
                  {normalized.claimedName}{' '}
                  {normalized.claimantRole
                    ? `(${normalized.claimantRole === 'client' ? 'Proveedor' : 'Cliente'})`
                    : ''}
                </p>
                <p className="text-gray-700 md:col-span-2">
                  <span className="font-medium">Servicio:</span> {normalized.serviceTitle}
                </p>
              </div>
            </div>

            {/* Descripción del Reclamo */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Descripción del Reclamo</h3>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Acción <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setAction('resolve')}
                  disabled={isSubmitting}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    action === 'resolve'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-semibold text-gray-900">Resolver</span>
                  </div>
                  <p className="text-xs text-gray-600">Reclamo es válido</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAction('reject')}
                  disabled={isSubmitting}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    action === 'reject'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle size={20} className="text-red-600" />
                    <span className="font-semibold text-gray-900">Rechazar</span>
                  </div>
                  <p className="text-xs text-gray-600">Reclamo no es válido</p>
                </button>
              </div>
            </div>

            {/* Tipo de resolución (solo si se resuelve) */}
            {action === 'resolve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de resolución <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* A favor del cliente */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={18} className="text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud: {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.CLIENT_FAVOR].hiringStatusLabel}
                      </p>
                    </div>
                  </label>

                  {/* A favor del proveedor */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={18} className="text-purple-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PROVIDER_FAVOR].hiringStatusLabel}
                      </p>
                    </div>
                  </label>

                  {/* Acuerdo parcial */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolutionType"
                      value={CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT}
                      checked={resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT}
                      onChange={(e) => setResolutionType(e.target.value)}
                      disabled={isSubmitting}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <HandshakeIcon size={18} className="text-green-600" />
                        <span className="font-semibold text-gray-900">
                          {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        → Estado de la solicitud: {CLAIM_RESOLUTION_CONFIG[CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT].hiringStatusLabel}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Campo adicional para acuerdo parcial */}
                {resolutionType === CLAIM_RESOLUTION_TYPES.PARTIAL_AGREEMENT && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <label htmlFor="partialAgreementDetails" className="block text-sm font-medium text-gray-700 mb-2">
                      Detalles del acuerdo (opcional)
                    </label>
                    <p className="text-xs text-gray-600 mb-3">
                      Especifica los términos del acuerdo parcial entre las partes
                    </p>
                    <InputField
                      multiline
                      rows={3}
                      name="partialAgreementDetails"
                      placeholder="Ej: El cliente pagará el 70% del monto acordado, el proveedor realizará ajustes menores..."
                      value={partialAgreementDetails}
                      onChange={(e) => setPartialAgreementDetails(e.target.value)}
                      maxLength={CLAIM_VALIDATION.PARTIAL_AGREEMENT_MAX_LENGTH}
                      disabled={isSubmitting}
                      showCharCount={true}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Advertencia para rechazos */}
            {action === 'reject' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">Al rechazar el reclamo:</p>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>El reclamo se marcará como &quot;Rechazado&quot;</li>
                  <li>La contratación volverá a su estado anterior</li>
                  <li>Ambas partes recibirán un email con el motivo del rechazo</li>
                </ul>
              </div>
            )}

            {/* Campo de resolución/explicación */}
            <div className="bg-white border rounded-lg p-4">
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                {action === 'resolve' ? 'Resolución / Explicación' : 'Motivo del rechazo'}{' '}
                <span className="text-red-500">*</span>
              </label>
              <InputField
                multiline
                rows={8}
                name="resolution"
                placeholder={
                  action === 'resolve'
                    ? 'Explica detalladamente la resolución del reclamo, qué se decidió y por qué...'
                    : 'Explica por qué se rechaza el reclamo. Sé específico y profesional...'
                }
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
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
            <Button type="button" onClick={handleClose} disabled={isSubmitting} variant="cancel">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              variant={action === 'resolve' ? 'success' : 'danger'}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Procesando...
                </>
              ) : action === 'resolve' ? (
                <>
                  <CheckCircle size={18} />
                  Resolver reclamo
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

export default ClaimResolutionModal;
