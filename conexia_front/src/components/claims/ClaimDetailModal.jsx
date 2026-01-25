/**
 * ClaimDetailModal Component
 * Modal para ver el detalle completo de un reclamo
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Calendar, User, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimRoleBadge } from './ClaimRoleBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import { ComplianceCard } from './ComplianceCard';
import { UploadComplianceEvidenceModal } from './UploadComplianceEvidenceModal';
import { formatClaimDateTime, getClaimTypeLabel } from '@/constants/claims';
import { config } from '@/config';
import { getClaimDetail, submitComplianceEvidence } from '@/service/claims';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/ui/Toast';

export const ClaimDetailModal = ({ claim: initialClaim, onClose }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [toast, setToast] = useState(null);

  const DEFAULT_AVATAR_SRC = '/images/default-avatar.png';

  const getFirstName = (fullName) => {
    if (!fullName) return '';
    const trimmed = String(fullName).trim();
    if (!trimmed) return '';
    return trimmed.split(/\s+/)[0] || '';
  };

  const getDisplayName = (profile) => {
    if (!profile) return '';
    const firstName = getFirstName(profile.name);
    const lastName = profile.lastName ? String(profile.lastName).trim() : '';
    return `${firstName} ${lastName}`.trim() || profile.name || '';
  };

  const titleCase = (value) => {
    if (!value) return '';
    return String(value)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getModeratorNameFromEmail = (email) => {
    if (!email) return 'Sin asignar';
    const [prefixRaw] = String(email).toLowerCase().split('@');
    if (!prefixRaw) return 'Sin asignar';

    const parts = prefixRaw
      .split('.')
      .map((p) => p.trim())
      .filter(Boolean);

    const roleSuffixes = new Set(['moderador', 'administrador', 'admin']);
    const cleanedParts = parts.filter((p) => !roleSuffixes.has(p));
    if (cleanedParts.length === 0) return 'Sin asignar';

    const firstName = cleanedParts[0];
    const lastName = cleanedParts.slice(1).join(' ');
    return titleCase(`${firstName} ${lastName}`.trim()) || 'Sin asignar';
  };

  const getClaimTypeLabelWithOtherReason = (claimObj) => {
    if (!claimObj) return '';
    const base = claimObj.claimTypeLabel || getClaimTypeLabel(claimObj.claimType);
    const isOtherType = claimObj.claimType === 'client_other' || claimObj.claimType === 'provider_other';
    const otherReason = claimObj.otherReason ? String(claimObj.otherReason).trim() : '';

    if (isOtherType && otherReason) {
      if (String(base).includes('(especificar)')) {
        return String(base).replace('(especificar)', `(${otherReason})`);
      }
      return `Otro (${otherReason})`;
    }

    return base;
  };

  const normalizeToArray = (value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  };

  const getClarificationEvidence = (claimObj) => {
    if (!claimObj) return [];
    // El backend puede exponer estos campos con nombres distintos según versión.
    return normalizeToArray(
      claimObj.clarificationEvidenceUrls ||
        claimObj.clarificationEvidence ||
        claimObj.additionalEvidenceUrls ||
        claimObj.newEvidenceUrls
    );
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!initialClaim) {
        setLoading(false);
        return;
      }

      // Verificar si ya tenemos toda la estructura de datos (viene desde admin panel)
      // Si initialClaim tiene las propiedades 'claim', 'claimant', 'otherUser', 'hiring',
      // entonces ya tenemos toda la data y no necesitamos hacer fetch
      if (initialClaim.claim && initialClaim.claimant && initialClaim.otherUser) {
        setData(initialClaim);
        setLoading(false);
        return;
      }

      // Si no, asumimos que initialClaim es solo el objeto claim y necesitamos hacer fetch
      const claimId = initialClaim.claim?.id || initialClaim.id;
      
      if (!claimId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getClaimDetail(claimId);
        // Guardar toda la data que incluye claim, claimant, otherUser, hiring
        setData(result);
      } catch (err) {
        console.error('Error fetching claim detail:', err);
        setError(err.message || 'Error al cargar el detalle');
        // Si hay error, usar datos iniciales
        setData({ claim: initialClaim });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [initialClaim]);

  const handleOpenUploadModal = (compliance) => {
    setSelectedCompliance(compliance);
    setShowUploadModal(true);
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setSelectedCompliance(null);
  };

  const handleSubmitEvidence = async (evidenceData) => {
    setIsSubmittingEvidence(true);
    try {
      await submitComplianceEvidence(evidenceData.complianceId, {
        files: evidenceData.files,
        userResponse: evidenceData.userResponse,
      });

      setToast({
        type: 'success',
        message: 'Evidencia enviada exitosamente. El moderador la revisará pronto.',
      });

      handleCloseUploadModal();

      // Refrescar datos del claim
      const claimId = data?.claim?.id || initialClaim?.claim?.id || initialClaim?.id;
      if (claimId) {
        const result = await getClaimDetail(claimId);
        setData(result);
      }
    } catch (err) {
      console.error('Error submitting compliance evidence:', err);
      setToast({
        type: 'error',
        message: err.message || 'Error al enviar la evidencia. Por favor intenta nuevamente.',
      });
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (!initialClaim) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-conexia-green to-emerald-600">
          <h2 className="text-xl font-bold text-white">
            Detalle del Reclamo
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-conexia-green mb-4" />
              <p className="text-gray-600">Cargando detalles del reclamo...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error al cargar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && data?.claim && (
            <>
              {/* Información General */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Información General</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600">ID del Reclamo</p>
                    <p className="text-sm font-mono font-medium text-gray-900">{data.claim.id}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-600">Moderador asignado</p>
                    {data.assignedModerator?.email ? (
                      <div className="flex items-center gap-2 mt-1">
                        <img
                          src={DEFAULT_AVATAR_SRC}
                          alt="Moderador"
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <p className="text-sm font-medium text-gray-900">
                          {getModeratorNameFromEmail(data.assignedModerator.email)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mt-1">Sin asignar</p>
                    )}
                  </div>
                  {data.hiring?.service && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Servicio</p>
                      <Link
                        href={`/services/${data.hiring.service.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-conexia-green hover:text-[#48a6a7] hover:underline flex items-center gap-1 transition-colors"
                      >
                        {data.hiring.service.title}
                      </Link>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Tipo de Reclamo</p>
                    <ClaimTypeBadge
                      claimType={data.claim.claimType}
                      labelOverride={getClaimTypeLabelWithOtherReason(data.claim)}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado</p>
                    <ClaimStatusBadge status={data.claim.status} />
                  </div>
                  {data.claim.userRole && (
                    <div>
                      <p className="text-sm text-gray-600">Tu Rol</p>
                      <ClaimRoleBadge role={data.claim.userRole} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Creación</p>
                    <p className="text-sm font-medium text-gray-900">{formatClaimDateTime(data.claim.createdAt)}</p>
                  </div>
                  
                </div>
              </div>

              {/* Usuarios Involucrados */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Usuarios Involucrados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reclamante</p>
                    <Link
                      href={`/profile/userProfile/${data.claimant?.profile?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors group"
                    >
                      <img
                        src={
                          data.claimant?.profile?.profilePicture
                            ? `${config.IMAGE_URL}/${data.claimant.profile.profilePicture}`
                            : DEFAULT_AVATAR_SRC
                        }
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR_SRC;
                        }}
                        alt={getDisplayName(data.claimant?.profile) || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#48a6a7]">
                          {getDisplayName(data.claimant?.profile)}
                        </p>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Reclamado</p>
                    <Link
                      href={`/profile/userProfile/${data.otherUser?.profile?.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors group"
                    >
                      <img
                        src={
                          data.otherUser?.profile?.profilePicture
                            ? `${config.IMAGE_URL}/${data.otherUser.profile.profilePicture}`
                            : DEFAULT_AVATAR_SRC
                        }
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR_SRC;
                        }}
                        alt={getDisplayName(data.otherUser?.profile) || 'Usuario'}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-[#48a6a7]">
                          {getDisplayName(data.otherUser?.profile)}
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Descripción del Reclamo */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-3">Descripción del reclamo</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {data.claim.description || 'No hay descripción disponible'}
                </p>
                {data.claim.evidenceUrls && data.claim.evidenceUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Evidencias Adjuntas:</p>
                    <ClaimEvidenceViewer evidenceUrls={data.claim.evidenceUrls} />
                  </div>
                )}
              </div>

              {/* Observaciones del Moderador (si existen) */}
              {data.claim.observations && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Observaciones del Moderador</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{data.claim.observations}</p>
                  {data.claim.observationsAt && (
                    <p className="text-xs text-gray-600">
                      Enviado el: {formatClaimDateTime(data.claim.observationsAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Respuesta del Reclamante (subsanación) */}
              {data.claim.clarificationResponse && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Respuesta del Reclamante</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{data.claim.clarificationResponse}</p>
                  {data.claim.clarificationResponseAt && (
                    <p className="text-xs text-gray-600">
                      Enviado el: {formatClaimDateTime(data.claim.clarificationResponseAt)}
                    </p>
                  )}

                  {getClarificationEvidence(data.claim).length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Evidencias de Subsanación:</p>
                      <ClaimEvidenceViewer evidenceUrls={getClarificationEvidence(data.claim)} />
                    </div>
                  )}
                </div>
              )}

              {/* Observaciones del Reclamado */}
              {data.claim.respondentObservations && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Observaciones del Reclamado</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{data.claim.respondentObservations}</p>
                  {data.claim.respondentObservationsAt && (
                    <p className="text-xs text-gray-600">
                      Enviado el: {formatClaimDateTime(data.claim.respondentObservationsAt)}
                    </p>
                  )}
                  {data.claim.respondentEvidenceUrls && data.claim.respondentEvidenceUrls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Archivos Adjuntos:</p>
                      <ClaimEvidenceViewer evidenceUrls={data.claim.respondentEvidenceUrls} />
                    </div>
                  )}
                </div>
              )}

              {/* Resolución del Moderador */}
              {data.claim.resolution && (
                <div className={`border rounded-lg p-4 ${
                  data.claim.resolutionType === 'client_favor'
                    ? 'bg-green-50 border-green-200' 
                    : data.claim.resolutionType === 'provider_favor'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h3 className="font-semibold text-lg text-gray-900 mb-3">Resolución del Moderador</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Decisión:</span>{' '}
                      <span className={
                        data.claim.resolutionType === 'client_favor' 
                          ? 'text-green-700 font-semibold' 
                          : data.claim.resolutionType === 'provider_favor'
                          ? 'text-red-700 font-semibold'
                          : 'text-yellow-700 font-semibold'
                      }>
                        {data.claim.resolutionType === 'client_favor' && 'A favor del cliente'}
                        {data.claim.resolutionType === 'provider_favor' && 'A favor del proveedor'}
                        {data.claim.resolutionType === 'partial_agreement' && 'Acuerdo parcial'}
                      </span>
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.claim.resolution}</p>
                    {data.claim.resolvedAt && (
                      <p className="text-xs text-gray-600">
                        Resuelto el: {formatClaimDateTime(data.claim.resolvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Compromisos Asignados */}
              {data.compliances && data.compliances.length > 0 && (
                <div className="border rounded-lg p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-conexia-green-dark">
                      Compromisos Asignados
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-white px-3 py-1 rounded-full text-gray-700 font-medium shadow-sm">
                        Total: {data.compliances.length} {data.compliances.length === 1 ? 'compromiso' : 'compromisos'}
                      </span>
                      {data.compliances.filter((c) => c.status === 'pending').length > 0 && (
                        <span className="text-xs bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-medium">
                          {data.compliances.filter((c) => c.status === 'pending').length} pendiente{data.compliances.filter((c) => c.status === 'pending').length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {data.compliances.map((compliance, index) => (
                      <ComplianceCard
                        key={compliance?.id || `compliance-${index}`}
                        compliance={compliance}
                        currentUserId={user?.id}
                        onUploadEvidence={() => handleOpenUploadModal(compliance)}
                        canUpload={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-conexia-green text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Subir Evidencia */}
      {showUploadModal && selectedCompliance && (
        <UploadComplianceEvidenceModal
          compliance={selectedCompliance}
          onClose={handleCloseUploadModal}
          onSubmit={handleSubmitEvidence}
          isSubmitting={isSubmittingEvidence}
        />
      )}

      {/* Toast de Notificación */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
};
