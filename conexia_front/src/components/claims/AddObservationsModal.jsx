/**
 * AddObservationsModal Component
 * Modal para que admin/moderador agregue observaciones a un reclamo
 * Cambia el estado del reclamo a "Pendiente subsanación"
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { addObservations, getClaimDetail } from '@/service/claims';
import { CLAIM_VALIDATION, getClaimTypeLabel } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import { ClaimEvidenceViewer } from '@/components/claims/ClaimEvidenceViewer';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';

export const AddObservationsModal = ({ isOpen, onClose, claim, claimId, onSuccess, showToast }) => {
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const baseClaimId = claimId || claim?.claim?.id || claim?.id;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!isOpen || !baseClaimId) {
        console.log('[AddObservationsModal] No open or no baseClaimId:', { isOpen, baseClaimId });
        return;
      }

      console.log('[AddObservationsModal] Starting fetch, claim structure:', {
        hasClaim: !!claim?.claim,
        hasClaimant: !!claim?.claimant,
        hasOtherUser: !!claim?.otherUser,
        baseClaimId
      });

      // Si ya tenemos estructura completa, no hacer fetch.
      if (claim?.claim && claim?.claimant && claim?.otherUser) {
        console.log('[AddObservationsModal] Using existing claim data');
        setDetail(claim);
        return;
      }

      try {
        setIsLoadingDetail(true);
        console.log('[AddObservationsModal] Fetching detail for:', baseClaimId);
        const result = await getClaimDetail(baseClaimId);
        console.log('[AddObservationsModal] Fetch successful:', result);
        setDetail(result);
      } catch (err) {
        console.error('[AddObservationsModal] Error fetching claim detail:', err);
        // Fallback: usar lo que venga en props.
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

    console.log('[AddObservationsModal] normalized data:', {
      hasDetail: !!detail,
      hasClaimData: !!claimData,
      hasClaimObj: !!claimObj,
      claimObjKeys: claimObj ? Object.keys(claimObj) : [],
      description: claimObj?.description,
      evidenceUrls: claimObj?.evidenceUrls
    });

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

    const normalizedData = {
      claimId: claimId || claimObj?.id,
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

    console.log('[AddObservationsModal] Returning normalized:', normalizedData);
    
    return normalizedData;
  }, [claim, claimId, detail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedObservations = observations.trim();

    // Validar observaciones
    if (trimmedObservations.length < CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH) {
      setError(`Las observaciones deben tener al menos ${CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH} caracteres`);
      return;
    }

    if (trimmedObservations.length > CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH) {
      setError(`Las observaciones no pueden exceder ${CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH} caracteres`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedClaim = await addObservations(normalized.claimId, {
        observations: trimmedObservations,
      });

      // Cerrar modal inmediatamente
      onClose();
      setObservations('');

      // Mostrar toast en la página padre
      if (showToast) {
        showToast('success', 'Observaciones agregadas exitosamente. El usuario será notificado.');
      }

      // Actualizar claim en el padre
      if (onSuccess) {
        onSuccess(updatedClaim);
      }
    } catch (err) {
      console.error('Error adding observations:', err);
      
      // Mostrar error en la página padre
      if (showToast) {
        showToast('error', err.message || 'Error al agregar observaciones. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setObservations('');
      setError(null);
    }
  };

  const characterCount = observations.trim().length;
  const minLength = CLAIM_VALIDATION.OBSERVATIONS_MIN_LENGTH;
  const maxLength = CLAIM_VALIDATION.OBSERVATIONS_MAX_LENGTH;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Agregar observaciones
              </h2>
            </div>
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
            {/* Info del reclamo (estilo detalle) */}
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
            {console.log('[AddObservationsModal] Rendering description section. normalized.description:', normalized.description)}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Descripción del reclamo</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {normalized.description || 'No hay descripción disponible'}
              </p>
            </div>

            {/* Evidencias actuales */}
            {console.log('[AddObservationsModal] Rendering evidences section. evidenceUrls length:', normalized.evidenceUrls?.length)}
            {normalized.evidenceUrls?.length > 0 && (
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Evidencias</h3>
                <ClaimEvidenceViewer evidenceUrls={normalized.evidenceUrls} />
              </div>
            )}

            {/* Explicación */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">¿Qué sucede al agregar observaciones?</p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>El usuario reclamante recibirá un email con tus observaciones</li>
                <li>El usuario podrá responder o actualizar su reclamo</li>
              </ul>
            </div>

            {/* Campo de observaciones */}
            <div className="bg-white border rounded-lg p-4">
              <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones <span className="text-red-500">*</span>
              </label>
              <InputField
                multiline
                rows={8}
                name="observations"
                placeholder="Escribe las observaciones que el usuario debe atender. Sé específico sobre qué información o evidencia adicional necesitas..."
                value={observations}
                onChange={(e) => {
                  setObservations(e.target.value);
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
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0 rounded-b-lg">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              variant="cancel"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              variant="warning"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar observaciones'
              )}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddObservationsModal;
