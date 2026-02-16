/**
 * MyClaimsPage Component
 * Página principal de reclamos del usuario (como reclamante o reclamado)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMyClaims } from '@/hooks/claims';
import { useAuth } from '@/context/AuthContext';
import { FaEllipsisH, FaRegEye, FaRegCopy } from 'react-icons/fa';
import { Filter, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/ui/Toast';
import { ClaimDetailModal } from './ClaimDetailModal';
import { SubmitObservationsModal } from './SubmitObservationsModal';
import { SubmitComplianceModal } from './SubmitComplianceModal';
import { SubsanarClaimModal } from './SubsanarClaimModal';
import { ClaimActionsModal } from './ClaimActionsModal';
import { SelectComplianceModal } from './SelectComplianceModal';
import { UploadComplianceEvidenceModal } from './UploadComplianceEvidenceModal';
import { SelectComplianceForReviewModal } from './SelectComplianceForReviewModal';
import { PeerReviewComplianceModal } from './PeerReviewComplianceModal';
import { ClaimTypeBadge } from './ClaimTypeBadge';
import { ClaimRoleBadge } from './ClaimRoleBadge';
import { ClaimStatusBadge } from './ClaimStatusBadge';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { formatClaimDate } from '@/constants/claims';
import { config } from '@/config';

export default function MyClaimsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Leer claimId de la URL
  const claimIdFromUrl = searchParams.get('claimId') || '';
  
  const { claims, pagination, loading, error, updateFilters, setPage } = useMyClaims({
    claimId: claimIdFromUrl,
  });

  const [filters, setFilters] = useState({
    status: '',
    role: 'all',
    claimId: claimIdFromUrl,
  });
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showObservationsModal, setShowObservationsModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showSubsanarModal, setShowSubsanarModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showSelectComplianceModal, setShowSelectComplianceModal] = useState(false);
  const [showUploadEvidenceModal, setShowUploadEvidenceModal] = useState(false);
  const [showSelectForReviewModal, setShowSelectForReviewModal] = useState(false);
  const [showPeerReviewModal, setShowPeerReviewModal] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [selectedClaimant, setSelectedClaimant] = useState(null);
  const [selectedOtherUser, setSelectedOtherUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Helper para formatear ID corto
  const formatShortId = (id) => {
    const value = String(id ?? '');
    if (value.length <= 10) return value;
    return `${value.slice(0, 8)}…`;
  };

  // Helper para copiar al portapapeles
  const copyToClipboard = async (text) => {
    const value = String(text ?? '');
    if (!value) return false;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {
      // fallback below
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      return ok;
    } catch (_) {
      return false;
    }
  };

  // Helper para obtener primer nombre
  const getFirstName = (fullName) => {
    if (!fullName) return '';
    const trimmed = String(fullName).trim();
    if (!trimmed) return '';
    return trimmed.split(/\s+/)[0] || '';
  };

  // Helper para obtener nombre corto (primer nombre + primer apellido)
  const getShortDisplayName = (profile) => {
    if (!profile) return 'N/A';
    const firstName = getFirstName(profile.name);
    const lastName = profile.lastName ? String(profile.lastName).trim().split(/\s+/)[0] : '';
    const composed = `${firstName} ${lastName}`.trim();
    return composed || profile.name || 'N/A';
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters({ ...newFilters, page: 1 });
  };

  const handleViewDetail = (claim) => {
    setSelectedClaim(claim);
    setShowDetailModal(true);
  };

  const handleOpenActions = (claim) => {
    setSelectedClaim(claim);
    setShowActionsModal(true);
  };

  const handleAction = (actionId, claim, compliance = null) => {
    setSelectedClaim(claim);
    setSelectedCompliance(compliance);
    
    switch (actionId) {
      case 'view_detail':
        setShowDetailModal(true);
        break;
      case 'submit_observations':
        setShowObservationsModal(true);
        break;
      case 'upload_compliance':
        setShowComplianceModal(true);
        break;
      case 'subsanar_claim':
        setShowSubsanarModal(true);
        break;
      case 'submit_compliance_evidence':
        // Verificar cuántos compliances tienen la acción submit_evidence
        handleComplianceAction(claim, 'submit_evidence');
        break;
      case 'peer_review':
        // Verificar cuántos compliances tienen peer_approve o peer_object
        handleComplianceAction(claim, 'peer_review');
        break;
      default:
        break;
    }
  };

  const handleComplianceAction = async (claim, actionType) => {
    try {
      // Obtener detalle del claim para tener los compliances actualizados
      const { getClaimDetail } = await import('@/service/claims');
      const result = await getClaimDetail(claim.id);
      
      const userRole = result.claim?.userRole;
      const claimant = userRole === 'claimant' ? result.yourProfile : result.otherUserProfile;
      const otherUser = userRole === 'claimant' ? result.otherUserProfile : result.yourProfile;
      
      // Filtrar compliances según el tipo de acción
      let availableCompliances = [];
      
      if (actionType === 'submit_evidence') {
        availableCompliances = result.compliances?.filter(c => 
          c.availableActions?.includes('submit_evidence')
        ) || [];
      } else if (actionType === 'peer_review') {
        availableCompliances = result.compliances?.filter(c => 
          c.availableActions?.includes('peer_approve') || 
          c.availableActions?.includes('peer_object')
        ) || [];
      }
      
      // Si solo hay 1 compliance, ir directamente al modal de acción
      if (availableCompliances.length === 1) {
        const compliance = availableCompliances[0];
        setSelectedCompliance(compliance);
        setSelectedClaimant(claimant);
        setSelectedOtherUser(otherUser);
        
        if (actionType === 'submit_evidence') {
          setShowUploadEvidenceModal(true);
        } else if (actionType === 'peer_review') {
          setShowPeerReviewModal(true);
        }
      } else if (availableCompliances.length > 1) {
        // Si hay más de 1, mostrar modal de selección
        if (actionType === 'submit_evidence') {
          setShowSelectComplianceModal(true);
        } else if (actionType === 'peer_review') {
          setShowSelectForReviewModal(true);
        }
      } else {
        // No hay compliances disponibles
        setToast({
          type: 'info',
          message: 'No hay compromisos disponibles para esta acción'
        });
      }
    } catch (err) {
      console.error('Error loading compliances:', err);
      setToast({
        type: 'error',
        message: 'Error al cargar los compromisos'
      });
    }
  };

  const handleActionSuccess = (message) => {
    setToast({
      type: 'success',
      message,
    });
    updateFilters(filters);
  };

  const handleSelectComplianceForReview = (compliance, claimant, otherUser) => {
    setSelectedCompliance(compliance);
    setSelectedClaimant(claimant);
    setSelectedOtherUser(otherUser);
    setShowSelectForReviewModal(false);
    setShowPeerReviewModal(true);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  return (
    <>
      <Navbar />
      <main className="bg-[#eaf5f2] min-h-screen p-4 sm:p-8 space-y-6 pb-24">
        {/* Header con título centrado y botón atrás */}
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Volver atrás"
            >
              <div className="relative w-6 h-6">
                <svg
                  className="w-6 h-6 text-conexia-green"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <line
                    x1="6.5"
                    y1="10"
                    x2="13.5"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <polyline
                    points="9,7 6,10 9,13"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
            <h1 className="text-2xl font-bold text-conexia-green flex-1 text-center mr-8">
              Mis Reclamos
            </h1>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-500" />
              <span className="font-medium text-gray-700">Filtros:</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="">Todos los estados</option>
                <option value="open">Abierto</option>
                <option value="in_review">En Revisión</option>
                <option value="pending_clarification">Requiere aclaración</option>
                <option value="requires_staff_response">Requiere respuesta</option>
                <option value="resolved">Resuelto</option>
                <option value="rejected">Rechazado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="all">Todos los roles</option>
                <option value="claimant">Como Reclamante</option>
                <option value="respondent">Como Reclamado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reclamos...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertTriangle size={56} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-900 mb-3">No pudimos obtener tus reclamos</h3>
            <p className="text-red-700 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => updateFilters(filters)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 16h5v5"/>
              </svg>
              Reintentar
            </button>
          </div>
        )}

        {/* Tabla de Reclamos */}
        {!loading && !error && (
          <>
            {claims.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay reclamos
                </h3>
                <p className="text-gray-600">
                  {filters.status || filters.role !== 'all'
                    ? 'No se encontraron reclamos con los filtros aplicados'
                    : 'Aún no tienes reclamos registrados'}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mi Rol
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contra
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Compromiso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {claims.map((claim) => (
                          <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-xs font-mono font-semibold text-gray-900"
                                  title={String(claim.id)}
                                >
                                  {formatShortId(claim.id)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(claim.id)}
                                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                                  title="Copiar ID completo"
                                >
                                  <FaRegCopy size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimTypeBadge claimType={claim.claimType} showIcon={false} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimRoleBadge role={claim.userRole} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    claim.otherUser?.profilePicture
                                      ? (claim.otherUser.profilePicture.startsWith('http') 
                                          ? claim.otherUser.profilePicture 
                                          : `${config.IMAGE_URL}/${claim.otherUser.profilePicture}`)
                                      : '/images/default-avatar.png'
                                  }
                                  alt={getShortDisplayName({
                                    name: claim.otherUser?.name,
                                    lastName: claim.otherUser?.lastName,
                                  })}
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/default-avatar.png';
                                  }}
                                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                />
                                <span className="text-sm font-medium text-gray-900">
                                  {getShortDisplayName({
                                    name: claim.otherUser?.name,
                                    lastName: claim.otherUser?.lastName,
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <ClaimStatusBadge status={claim.status} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(() => {
                                if (!claim.compliances || claim.compliances.length === 0) {
                                  return <span className="text-xs text-gray-400 italic">Sin compromisos</span>;
                                }
                                
                                const total = claim.compliances.length;
                                const pending = claim.compliances.filter(c => c.status === 'pending').length;
                                const approved = claim.compliances.filter(c => c.status === 'approved').length;
                                const submitted = claim.compliances.filter(c => c.status === 'submitted').length;
                                const isResponsible = claim.compliances.some(c => String(c.responsibleUserId) === String(user?.id));
                                
                                if (approved === total) {
                                  return (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {total} completado{total !== 1 ? 's' : ''}
                                      </span>
                                      {isResponsible && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                          Tu compromiso
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                                
                                if (pending > 0 || submitted > 0) {
                                  return (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        {pending + submitted} en curso
                                      </span>
                                      {isResponsible && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                          Tu compromiso
                                        </span>
                                      )}
                                    </div>
                                  );
                                }
                                
                                return (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                    {total} {total === 1 ? 'compromiso' : 'compromisos'}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatClaimDate(claim.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border">
                                  {/* Botón para ver detalle */}
                                  <button
                                    onClick={() => handleViewDetail(claim)}
                                    className="flex items-center justify-center w-9 h-9 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                    title="Ver detalle"
                                    aria-label="Ver detalle"
                                  >
                                    <FaRegEye className="text-[16px] group-hover:scale-110 transition-transform" />
                                  </button>
                                  
                                  {/* Botón para más acciones */}
                                  <button
                                    onClick={() => handleOpenActions(claim)}
                                    className="flex items-center justify-center w-9 h-9 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                    title="Más acciones"
                                    aria-label="Más acciones"
                                  >
                                    <FaEllipsisH className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-mono font-semibold text-gray-900 break-all" title={String(claim.id)}>
                              {String(claim.id)}
                            </p>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(claim.id)}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded flex-shrink-0"
                              title="Copiar ID completo"
                            >
                              <FaRegCopy size={14} />
                            </button>
                          </div>
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 mb-1">Tipo de Reclamo</p>
                            <ClaimTypeBadge claimType={claim.claimType} showIcon={false} />
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <ClaimStatusBadge status={claim.status} />
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="mb-2">
                          <p className="text-xs text-gray-600 mb-1">Mi Rol</p>
                          <ClaimRoleBadge role={claim.userRole} />
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-gray-600 mb-1">Contra</p>
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                claim.otherUser?.profilePicture
                                  ? (claim.otherUser.profilePicture.startsWith('http') 
                                      ? claim.otherUser.profilePicture 
                                      : `${config.IMAGE_URL}/${claim.otherUser.profilePicture}`)
                                  : '/images/default-avatar.png'
                              }
                              alt={getShortDisplayName({
                                name: claim.otherUser?.name,
                                lastName: claim.otherUser?.lastName,
                              })}
                              onError={(e) => {
                                e.currentTarget.src = '/images/default-avatar.png';
                              }}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <p className="text-sm font-medium text-gray-900">
                              {getShortDisplayName({
                                name: claim.otherUser?.name,
                                lastName: claim.otherUser?.lastName,
                              })}
                            </p>
                          </div>
                        </div>
                        {claim.compliances && claim.compliances.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-600 mb-1">Compromiso</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const total = claim.compliances.length;
                                const pending = claim.compliances.filter(c => c.status === 'pending').length;
                                const approved = claim.compliances.filter(c => c.status === 'approved').length;
                                const submitted = claim.compliances.filter(c => c.status === 'submitted').length;
                                const isResponsible = claim.compliances.some(c => String(c.responsibleUserId) === String(user?.id));
                                
                                if (approved === total) {
                                  return (
                                    <>
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {total} completado{total !== 1 ? 's' : ''}
                                      </span>
                                      {isResponsible && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                          Tu compromiso
                                        </span>
                                      )}
                                    </>
                                  );
                                }
                                
                                if (pending > 0 || submitted > 0) {
                                  return (
                                    <>
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                        {pending + submitted} en curso
                                      </span>
                                      {isResponsible && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                          Tu compromiso
                                        </span>
                                      )}
                                    </>
                                  );
                                }
                                
                                return (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                    {total} {total === 1 ? 'compromiso' : 'compromisos'}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {formatClaimDate(claim.createdAt)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                              onClick={() => handleViewDetail(claim)}
                              className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                              title="Ver detalle"
                              aria-label="Ver detalle"
                            >
                              <FaRegEye className="text-[15px] group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <button
                              onClick={() => handleOpenActions(claim)}
                              className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                              title="Más acciones"
                              aria-label="Más acciones"
                            >
                              <FaEllipsisH className="text-[16px] group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={setPage}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Modales */}
      {showDetailModal && selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setShowDetailModal(false)}
          showToast={(type, message) => setToast({ type, message })}
        />
      )}

      {showObservationsModal && selectedClaim && (
        <SubmitObservationsModal
          claim={selectedClaim}
          onClose={() => setShowObservationsModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showComplianceModal && selectedClaim && (
        <SubmitComplianceModal
          claim={selectedClaim}
          compliance={selectedCompliance}
          onClose={() => setShowComplianceModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showSubsanarModal && selectedClaim && (
        <SubsanarClaimModal
          isOpen={showSubsanarModal}
          claim={selectedClaim}
          onClose={() => setShowSubsanarModal(false)}
          onSuccess={() => updateFilters(filters)}
          showToast={(type, message) =>
            setToast({ type, message })
          }
        />
      )}

      {showActionsModal && selectedClaim && (
        <ClaimActionsModal
          claim={selectedClaim}
          onClose={() => setShowActionsModal(false)}
          onAction={handleAction}
        />
      )}

      {showSelectComplianceModal && selectedClaim && (
        <SelectComplianceModal
          claim={selectedClaim}
          currentUserId={user?.id}
          onClose={() => setShowSelectComplianceModal(false)}
          onSelectCompliance={(compliance, claimant, otherUser) => {
            setSelectedCompliance(compliance);
            setSelectedClaimant(claimant);
            setSelectedOtherUser(otherUser);
            setShowUploadEvidenceModal(true);
          }}
        />
      )}

      {showUploadEvidenceModal && selectedCompliance && (
        <UploadComplianceEvidenceModal
          compliance={selectedCompliance}
          onClose={() => {
            setShowUploadEvidenceModal(false);
            setSelectedCompliance(null);
          }}
          onSubmit={async (evidenceData) => {
            try {
              setIsSubmittingEvidence(true);
              const { submitComplianceEvidence } = await import('@/service/claims');
              
              await submitComplianceEvidence(evidenceData.complianceId, {
                userResponse: evidenceData.userResponse,
                files: evidenceData.files
              });
              
              setShowUploadEvidenceModal(false);
              setSelectedCompliance(null);
              
              // Mostrar toast ANTES de recargar
              setToast({
                type: 'success',
                message: 'Evidencia enviada correctamente. Tu evidencia será revisada pronto.'
              });
              
              // Esperar un momento para que el toast se muestre antes de recargar
              setTimeout(() => {
                updateFilters(filters);
              }, 100);
            } catch (err) {
              console.error('Error submitting compliance evidence:', err);
              setToast({
                type: 'error',
                message: err.message || 'Error al enviar la evidencia. Por favor, intenta nuevamente.'
              });
            } finally {
              setIsSubmittingEvidence(false);
            }
          }}
          isSubmitting={isSubmittingEvidence}
          claimant={selectedClaimant}
          otherUser={selectedOtherUser}
          currentUserId={user?.id}
        />
      )}

      {/* Modal de selección para peer review */}
      {showSelectForReviewModal && selectedClaim && (
        <SelectComplianceForReviewModal
          claimId={selectedClaim.id}
          onClose={() => setShowSelectForReviewModal(false)}
          onSelectCompliance={handleSelectComplianceForReview}
          currentUserId={user?.id}
          actionType="peer_review"
          showToast={showToast}
        />
      )}

      {/* Modal de revisión de compromiso (peer review unificado) */}
      {showPeerReviewModal && selectedCompliance && (
        <PeerReviewComplianceModal
          compliance={selectedCompliance}
          claimant={selectedClaimant}
          otherUser={selectedOtherUser}
          currentUserId={user?.id}
          onClose={() => {
            setShowPeerReviewModal(false);
            setSelectedCompliance(null);
            setSelectedClaimant(null);
            setSelectedOtherUser(null);
          }}
          onSuccess={(message) => {
            setShowPeerReviewModal(false);
            setSelectedCompliance(null);
            setSelectedClaimant(null);
            setSelectedOtherUser(null);
            handleActionSuccess(message);
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={true}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </>
  );
}
