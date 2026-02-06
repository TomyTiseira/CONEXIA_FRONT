/**
 * ClaimDetailModal Component
 * Modal para ver el detalle completo de un reclamo
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { X, Calendar, User, AlertCircle, Loader2, ExternalLink, FileText, MessageSquare, Scale, ClipboardList, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimRoleBadge } from './ClaimRoleBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import { ComplianceCard } from './ComplianceCard';
import { UploadComplianceEvidenceModal } from './UploadComplianceEvidenceModal';
import { PeerReviewComplianceModal } from './PeerReviewComplianceModal';
import { ReviewComplianceModal } from './ReviewComplianceModal';
import { formatClaimDateTime, getClaimTypeLabel, COMPLIANCE_TYPE_LABELS } from '@/constants/claims';
import { config } from '@/config';
import { getClaimDetail, submitComplianceEvidence } from '@/service/claims';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/hooks/useRole';
import { ROLES } from '@/constants/roles';
import Toast from '@/components/ui/Toast';

export const ClaimDetailModal = ({ claim: initialClaim, onClose, showToast }) => {
  const { user } = useAuth();
  const { role: userRole } = useRole(user?.roleId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [moderatorReviewModalOpen, setModeratorReviewModalOpen] = useState(false);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [expandedCompliances, setExpandedCompliances] = useState({});
  const [internalToast, setInternalToast] = useState({ isVisible: false, type: '', message: '' });

  const DEFAULT_AVATAR_SRC = '/images/default-avatar.png';

  // Helper para mostrar toast interno
  const showInternalToast = (type, message) => {
    setInternalToast({ isVisible: true, type, message });
  };

  const handleCloseInternalToast = () => {
    setInternalToast({ isVisible: false, type: '', message: '' });
  };

  // Manejar apertura del modal de subida de evidencia
  const handleUploadEvidence = (compliance) => {
    setSelectedCompliance(compliance);
    setUploadModalOpen(true);
  };

  // Manejar apertura del modal de revisión de compromiso
  const handleReviewCompliance = (compliance) => {
    setSelectedCompliance(compliance);
    setReviewModalOpen(true);
  };

  // Manejar apertura del modal de revisión del moderador
  const handleModeratorReviewCompliance = (compliance) => {
    setSelectedCompliance(compliance);
    setModeratorReviewModalOpen(true);
  };

  // Manejar envío de evidencia
  const handleSubmitEvidence = async (evidenceData) => {
    try {
      setIsSubmittingEvidence(true);

      await submitComplianceEvidence(evidenceData.complianceId, {
        userResponse: evidenceData.userResponse,
        files: evidenceData.files
      });
      
      setUploadModalOpen(false);
      setSelectedCompliance(null);
      
      showInternalToast('success', 'Evidencia enviada correctamente. Tu evidencia será revisada pronto.');
      
      // Recargar los datos del claim
      const claimId = data.claim.id;
      const result = await getClaimDetail(claimId);
      
      if (result.yourProfile && result.otherUserProfile) {
        const userRole = result.claim?.userRole;
        const transformedData = {
          ...result,
          claimant: userRole === 'claimant' ? result.yourProfile : result.otherUserProfile,
          otherUser: userRole === 'claimant' ? result.otherUserProfile : result.yourProfile,
        };
        setData(transformedData);
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Error submitting compliance evidence:', err);
      showInternalToast('error', err.message || 'Error al enviar la evidencia. Por favor, intenta nuevamente.');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

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

      // Verificar si ya tenemos toda la estructura de datos completa (viene desde admin panel)
      // Si initialClaim tiene las propiedades 'claim', 'claimant', 'otherUser' con estructura completa de profile
      if (initialClaim.claim && initialClaim.claimant?.profile && initialClaim.otherUser?.profile) {
        setData(initialClaim);
        setLoading(false);
        return;
      }

      // En todos los demás casos (desde "Mis Reclamos" o datos incompletos), hacer fetch del detalle completo
      const claimId = initialClaim.claim?.id || initialClaim.id;
      
      if (!claimId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getClaimDetail(claimId);
        
        // El backend ahora devuelve yourProfile y otherUserProfile
        // Necesitamos transformarlo al formato esperado (claimant y otherUser)
        if (result.yourProfile && result.otherUserProfile) {
          const userRole = result.claim?.userRole;
          
          // Si userRole es "claimant", yourProfile es el reclamante
          // Si userRole es "respondent", yourProfile es el reclamado
          const transformedData = {
            ...result,
            claimant: userRole === 'claimant' ? result.yourProfile : result.otherUserProfile,
            otherUser: userRole === 'claimant' ? result.otherUserProfile : result.yourProfile,
          };
          
          setData(transformedData);
        } else {
          // Formato antiguo (desde admin panel)
          setData(result);
        }
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

  // Inicializar compromisos expandidos cuando cambia la data
  useEffect(() => {
    if (data?.compliances) {
      // Todos los compromisos empiezan cerrados
      setExpandedCompliances({});
    }
  }, [data?.compliances]);

  // Determinar qué tabs mostrar basado en el contenido disponible
  const tabs = useMemo(() => {
    const availableTabs = [
      { id: 'info', label: 'Información', icon: FileText, show: true }
    ];

    // Tab de Seguimiento (si hay observaciones o respuestas)
    const hasCommunication = 
      data?.claim?.observations || 
      data?.claim?.clarificationResponse || 
      data?.claim?.respondentObservations;
    
    if (hasCommunication) {
      availableTabs.push({ 
        id: 'tracking', 
        label: 'Seguimiento', 
        icon: MessageSquare, 
        show: true 
      });
    }

    // Tab de Resolución (si está resuelto)
    if (data?.claim?.resolution) {
      availableTabs.push({ 
        id: 'resolution', 
        label: 'Resolución', 
        icon: Scale, 
        show: true 
      });
    }

    // Tab de Compromisos (si existen)
    if (data?.compliances && data.compliances.length > 0) {
      availableTabs.push({ 
        id: 'compliances', 
        label: 'Compromisos', 
        icon: ClipboardList, 
        show: true,
        count: data.compliances.length,
        pendingCount: data.compliances.filter(c => c.status === 'pending').length
      });
    }

    return availableTabs;
  }, [data]);

  // Renderizar contenido según tab activa
  const renderTabContent = () => {
    if (!data?.claim) return null;

    switch (activeTab) {
      case 'info':
        return renderInfoTab();
      case 'tracking':
        return renderTrackingTab();
      case 'resolution':
        return renderResolutionTab();
      case 'compliances':
        return renderCompliancesTab();
      default:
        return renderInfoTab();
    }
  };

  // Tab de Información
  const renderInfoTab = () => (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 bg-blue-100 border-b border-blue-200 rounded-t-xl">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Información General
          </h3>
        </div>
        <div className="p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-600 mb-1.5">ID del Reclamo</p>
            <p className="text-sm font-mono font-medium text-gray-900">{data.claim.id}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-gray-600 mb-1.5">Moderador asignado</p>
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
              <p className="text-xs font-medium text-gray-600 mb-1.5">Servicio</p>
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
            <p className="text-xs font-medium text-gray-600 mb-1.5">Tipo de Reclamo</p>
            <ClaimTypeBadge
              claimType={data.claim.claimType}
              labelOverride={getClaimTypeLabelWithOtherReason(data.claim)}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Estado</p>
            <ClaimStatusBadge status={data.claim.status} />
          </div>
          {data.claim.userRole && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">Tu Rol</p>
              <ClaimRoleBadge role={data.claim.userRole} />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1.5">Fecha de Creación</p>
            <p className="text-sm font-medium text-gray-900">{formatClaimDateTime(data.claim.createdAt)}</p>
          </div>
        </div>
        </div>
      </div>

      {/* Usuarios Involucrados */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 bg-blue-100 border-b border-blue-200 rounded-t-xl">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <User size={20} className="text-blue-600" />
            Usuarios Involucrados
          </h3>
        </div>
        <div className="p-6 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Reclamante</p>
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
            <p className="text-xs font-medium text-gray-600 mb-2">Reclamado</p>
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
      </div>

      {/* Descripción del Reclamo */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 bg-blue-100 border-b border-blue-200 rounded-t-xl">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-blue-600" />
            Descripción del Reclamo
          </h3>
        </div>
        <div className="p-6">
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
      </div>
    </div>
  );

  // Tab de Seguimiento
  const renderTrackingTab = () => (
    <div className="space-y-6">
      {/* Observaciones del Moderador */}
      {data.claim.observations && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 bg-orange-100 border-b border-orange-200 rounded-t-xl">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-orange-600" />
              Observaciones del Moderador
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.claim.observations}</p>
            {data.claim.observationsAt && (
              <p className="text-xs text-gray-600 font-medium">
                Enviado el: {formatClaimDateTime(data.claim.observationsAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Respuesta del Reclamante (subsanación) */}
      {data.claim.clarificationResponse && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 bg-orange-100 border-b border-orange-200 rounded-t-xl">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-orange-600" />
              Respuesta del Reclamante
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.claim.clarificationResponse}</p>
            {data.claim.clarificationResponseAt && (
              <p className="text-xs text-gray-600 font-medium">
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
        </div>
      )}

      {/* Observaciones del Reclamado */}
      {data.claim.respondentObservations && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl shadow-sm">
          <div className="px-6 py-4 bg-orange-100 border-b border-orange-200 rounded-t-xl">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <MessageSquare size={20} className="text-orange-600" />
              Observaciones del Reclamado
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.claim.respondentObservations}</p>
            {data.claim.respondentObservationsAt && (
              <p className="text-xs text-gray-600 font-medium">
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
        </div>
      )}

      {(!data.claim.observations && !data.claim.clarificationResponse && !data.claim.respondentObservations) && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No hay comunicaciones aún</p>
        </div>
      )}
    </div>
  );

  // Tab de Resolución
  const renderResolutionTab = () => {
    const isClientFavor = data.claim.resolutionType === 'client_favor';
    const isProviderFavor = data.claim.resolutionType === 'provider_favor';
    const isPartialAgreement = data.claim.resolutionType === 'partial_agreement';
    const isRejected = data.claim.status === 'rejected';

    return (
      <div className="space-y-6">
        {data.claim.resolution && (
          <div className={`border-2 rounded-xl shadow-sm ${
            isRejected
              ? 'bg-red-50 border-red-200'
              : isClientFavor
              ? 'bg-green-50 border-green-200' 
              : isProviderFavor
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b rounded-t-xl ${
              isRejected
                ? 'bg-red-100 border-red-200'
                : isClientFavor
                ? 'bg-green-100 border-green-200' 
                : isProviderFavor
                ? 'bg-red-100 border-red-200'
                : 'bg-yellow-100 border-yellow-200'
            }`}>
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Scale size={20} className={isRejected ? 'text-red-600' : isClientFavor ? 'text-green-600' : isProviderFavor ? 'text-red-600' : 'text-yellow-600'} />
                {isRejected ? 'Reclamo Rechazado' : 'Resolución del Reclamo'}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {/* Estado y Tipo de Resolución */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Estado</p>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                    isRejected
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-green-100 text-green-700 border border-green-300'
                  }`}>
                    {isRejected ? '✕ Rechazado' : '✓ Resuelto'}
                  </div>
                </div>
                {data.claim.resolutionType && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1.5">Tipo de Resolución</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm ${
                      isClientFavor
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : isProviderFavor
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    }`}>
                      {isClientFavor && '✓ A favor del cliente'}
                      {isProviderFavor && '✓ A favor del proveedor'}
                      {isPartialAgreement && '✓ Acuerdo parcial'}
                    </div>
                  </div>
                )}
              </div>

              {/* Resuelto por */}
              {data.claim.resolvedByEmail && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-2">Resuelto por</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={DEFAULT_AVATAR_SRC}
                      alt="Moderador"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <p className="text-sm font-medium text-gray-900">
                      {getModeratorNameFromEmail(data.claim.resolvedByEmail)}
                    </p>
                  </div>
                </div>
              )}

              {/* Fecha de resolución */}
              {data.claim.resolvedAt && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1.5">Fecha de Resolución</p>
                  <p className="text-sm font-medium text-gray-900">{formatClaimDateTime(data.claim.resolvedAt)}</p>
                </div>
              )}

              {/* Explicación */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Explicación de la Resolución</p>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{data.claim.resolution}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Tab de Compromisos
  const renderCompliancesTab = () => {
    const toggleCompliance = (index) => {
      setExpandedCompliances(prev => ({
        ...prev,
        [index]: !prev[index]
      }));
    };

    return (
      <div className="space-y-6">
        {data.compliances && data.compliances.length > 0 ? (
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 bg-purple-100 border-b border-purple-200 rounded-t-xl flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <ClipboardList size={20} className="text-purple-600" />
                Compromisos Asignados
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-purple-200 px-3 py-1 rounded-full text-purple-800 font-semibold">
                  Total: {data.compliances.length}
                </span>
                {data.compliances.filter((c) => c.status === 'pending').length > 0 && (
                  <span className="text-xs bg-yellow-100 px-3 py-1 rounded-full text-yellow-700 font-semibold border border-yellow-300">
                    {data.compliances.filter((c) => c.status === 'pending').length} pendiente{data.compliances.filter((c) => c.status === 'pending').length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Content - Acordeón */}
            <div className="p-6 space-y-3">
              {data.compliances.map((compliance, index) => {
                const isExpanded = expandedCompliances[index];
                return (
                  <div key={compliance?.id || `compliance-${index}`} className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden">
                    {/* Header del acordeón - Clickeable */}
                    <button
                      onClick={() => toggleCompliance(index)}
                      className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors relative"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`transform transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
                          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <span className="font-bold text-sm text-gray-900 flex-1 text-left">
                          {COMPLIANCE_TYPE_LABELS[compliance.complianceType] || compliance.complianceType}
                        </span>
                        {String(compliance.responsibleUserId) === String(user?.id) && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                            Tu compromiso
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between ml-6">
                        <ComplianceStatusBadge status={compliance.status} />
                        {compliance.deadline && (
                          <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(compliance.deadline).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'short'
                            })}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Contenido expandible */}
                    {isExpanded && (
                      <div className="border-t-2 border-purple-200">
                        <ComplianceCard
                          compliance={compliance}
                          currentUserId={user?.id}
                          canUpload={true}
                          onUploadEvidence={() => handleUploadEvidence(compliance)}
                          onReviewCompliance={() => handleReviewCompliance(compliance)}
                          onModeratorReviewCompliance={() => handleModeratorReviewCompliance(compliance)}
                          claimant={data.claimant}
                          otherUser={data.otherUser}
                          showCompactHeader={true}
                          isModerator={userRole === ROLES.MODERATOR || userRole === ROLES.ADMIN}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-xl py-12">
            <div className="text-center">
              <ClipboardList size={48} className="mx-auto text-purple-300 mb-3" />
              <p className="text-purple-600 font-medium">No hay compromisos asignados</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!initialClaim) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-conexia-green to-emerald-600 flex-shrink-0">
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
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-conexia-green mb-4" />
              <p className="text-gray-600">Cargando detalles del reclamo...</p>
            </div>
          )}

          {error && (
            <div className="px-6 py-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error al cargar</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && data?.claim && (
            <>
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 px-6 pt-2 flex-shrink-0">
                <div className="flex gap-1 -mb-px overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                          isActive
                            ? 'border-conexia-green text-conexia-green'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                        {tab.count && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            isActive 
                              ? 'bg-conexia-green/10 text-conexia-green' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tab.count}
                          </span>
                        )}
                        {tab.pendingCount > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                            {tab.pendingCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
                <div className="pb-4">
                  {renderTabContent()}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-conexia-green text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>

        {/* Toast interno para mostrar sobre el modal */}
        {internalToast.isVisible && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <Toast
              type={internalToast.type}
              message={internalToast.message}
              isVisible={internalToast.isVisible}
              onClose={handleCloseInternalToast}
              position="top-center"
              useFixedPosition={false}
            />
          </div>
        )}
      </div>

      {/* Modal de subida de evidencia */}
      {uploadModalOpen && selectedCompliance && (
        <UploadComplianceEvidenceModal
          compliance={selectedCompliance}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedCompliance(null);
          }}
          onSubmit={handleSubmitEvidence}
          isSubmitting={isSubmittingEvidence}
          claimant={data?.claimant}
          otherUser={data?.otherUser}
          currentUserId={user?.id}
        />
      )}

      {/* Modal de revisión de compromiso */}
      {reviewModalOpen && selectedCompliance && (
        <PeerReviewComplianceModal
          compliance={selectedCompliance}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedCompliance(null);
          }}
          showToast={showInternalToast}
          onSuccess={async (message) => {
            setReviewModalOpen(false);
            setSelectedCompliance(null);
            
            showInternalToast('success', message);
            
            // Recargar los datos del claim
            try {
              const claimId = data.claim.id;
              const result = await getClaimDetail(claimId);
              
              if (result.yourProfile && result.otherUserProfile) {
                const userRole = result.claim?.userRole;
                const transformedData = {
                  ...result,
                  claimant: userRole === 'claimant' ? result.yourProfile : result.otherUserProfile,
                  otherUser: userRole === 'claimant' ? result.otherUserProfile : result.yourProfile,
                };
                setData(transformedData);
              } else {
                setData(result);
              }
            } catch (err) {
              console.error('Error reloading claim:', err);
            }
          }}
          claimant={data?.claimant}
          otherUser={data?.otherUser}
          currentUserId={user?.id}
        />
      )}

      {/* Modal de revisión del moderador */}
      {moderatorReviewModalOpen && selectedCompliance && (
        <ReviewComplianceModal
          compliance={selectedCompliance}
          onClose={() => {
            setModeratorReviewModalOpen(false);
            setSelectedCompliance(null);
          }}
          showToast={showInternalToast}
          onSuccess={async (message) => {
            setModeratorReviewModalOpen(false);
            setSelectedCompliance(null);
            
            showInternalToast('success', message);
            
            // Recargar los datos del claim
            try {
              const claimId = data.claim.id;
              const result = await getClaimDetail(claimId);
              
              if (result.yourProfile && result.otherUserProfile) {
                const userRole = result.claim?.userRole;
                const transformedData = {
                  ...result,
                  claimant: userRole === 'claimant' ? result.yourProfile : result.otherUserProfile,
                  otherUser: userRole === 'claimant' ? result.otherUserProfile : result.yourProfile,
                };
                setData(transformedData);
              } else {
                setData(result);
              }
            } catch (err) {
              console.error('Error reloading claim:', err);
            }
          }}
          claimant={data?.claimant}
          otherUser={data?.otherUser}
          currentUserId={user?.id}
        />
      )}
    </div>
  );
};
