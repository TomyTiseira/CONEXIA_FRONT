'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { ChevronDown, ArrowLeft, FileText, Filter, Package, Clock, X } from 'lucide-react';
// Nuevos iconos más semánticos desde react-icons
import { 
  FaRegEye,      /* Ver detalle */
  FaFileInvoiceDollar, /* Ver cotización */
  FaEllipsisH,   /* Más acciones */
  FaExchangeAlt, /* Posibles acciones de negociación en otros contextos */
  FaStar         /* Realizar reseña */
} from 'react-icons/fa';
import { Briefcase } from 'lucide-react';
import { getUnitLabel } from '@/utils/timeUnit';
import { calculateDaysLeft, isExpired } from '@/utils/quotationVigency';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import QuotationModal from '@/components/services/QuotationModal';
import ServiceHiringActionsModal from '@/components/services/ServiceHiringActionsModal';
import ContractServiceButton from '@/components/services/ContractServiceButton';
import RequestDetailModal from '@/components/services/RequestDetailModal';
import ServiceReviewModal from '@/components/services/ServiceReviewModal';
import Toast from '@/components/ui/Toast';
import Button from '../ui/Button';
import BackButton from '@/components/ui/BackButton';
import { useClaimPermissions } from '@/hooks/claims';
import { useUserStore } from '@/store/userStore';
import { ClaimModal } from '@/components/claims/ClaimModal';
import { AlertCircle } from 'lucide-react';
import { 
  SERVICE_HIRING_STATUS_OPTIONS, 
  getServiceHiringStatusBadge,
  isReadOnlyState,
  isTerminatedByModeration
} from '@/constants/serviceHirings';

const STATUS_OPTIONS = SERVICE_HIRING_STATUS_OPTIONS;

const getStatusBadge = (statusCode) => {
  const { label, className } = getServiceHiringStatusBadge(statusCode);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
};

export default function MyServiceHiringsPage() {
  // Abreviaturas para las unidades de tiempo
  const getUnitAbbr = (timeUnit) => {
    const map = { hours: 'h', days: 'd', weeks: 's', months: 'm' };
    return map[timeUnit] || 'h';
  };

  const router = useRouter();
  const { user, token } = useUserStore();
  const { 
    hirings, 
    pagination, 
    loading, 
    error, 
    loadMyHirings
  } = useServiceHirings();

  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showRequestDetailModal, setShowRequestDetailModal] = useState(false);
  const [selectedHiring, setSelectedHiring] = useState(null);
  const [toast, setToast] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimHiring, setClaimHiring] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewHiring, setReviewHiring] = useState(null);

  useEffect(() => {
    loadMyHirings(filters);
  }, [filters, loadMyHirings]);

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleViewQuotation = (hiring) => {
    setSelectedHiring(hiring);
    setShowQuotationModal(true);
  };

  const handleOpenActions = (hiring) => {
    setSelectedHiring(hiring);
    setShowActionsModal(true);
  };

  const handleViewRequestDetail = (hiring) => {
    setSelectedHiring(hiring);
    setShowRequestDetailModal(true);
  };

  const handleActionSuccess = (message) => {
    setToast({
      type: 'success',
      message: message,
      isVisible: true
    });
    // Recargar datos
    loadMyHirings(filters);
  };

  const handleActionError = (message) => {
    setToast({
      type: 'error',
      message: message,
      isVisible: true
    });
  };

  const handleContractSuccess = (result) => {
    setToast({
      type: 'success',
      message: '¡Servicio contratado exitosamente! Redirigiendo a MercadoPago...',
      isVisible: true
    });
    // Recargar datos para reflejar el nuevo estado
    setTimeout(() => {
      loadMyHirings(filters);
    }, 2000);
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const handleOpenClaimModal = (hiring) => {
    setClaimHiring(hiring);
    setIsClaimModalOpen(true);
  };

  const handleClaimSuccess = (createdClaim) => {
    setToast({
      type: 'success',
      message: 'Reclamo creado exitosamente. Redirigiendo a Mis Reclamos...',
      isVisible: true
    });
    setIsClaimModalOpen(false);
    setClaimHiring(null);
    // Recargar datos
    loadMyHirings(filters);
    
    // Redirigir a la página de reclamos después de 2 segundos con el claimId
    if (createdClaim?.id) {
      setTimeout(() => {
        router.push(`/claims/my-claims?claimId=${createdClaim.id}`);
      }, 2000);
    }
  };

  const handleOpenReviewModal = (hiring) => {
    setReviewHiring(hiring);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setToast({
      type: 'success',
      message: 'Reseña enviada exitosamente',
      isVisible: true
    });
    setShowReviewModal(false);
    setReviewHiring(null);
    // Recargar datos
    loadMyHirings(filters);
  };

  const handleReviewError = (message) => {
    setToast({
      type: 'error',
      message: message || 'Error al enviar la reseña',
      isVisible: true
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const canViewQuotation = (hiring) => {
    return ['quoted', 'accepted', 'rejected', 'negotiating'].includes(hiring.status?.code);
  };

  // Usar funciones importadas de las utilidades

  const getVigencyDisplay = (hiring) => {
    if (!canViewQuotation(hiring)) return "N/A";
    
    // Si ya fue aceptada o está en estados posteriores, la vigencia ya no aplica
    const postAcceptanceStates = ['accepted', 'in_progress', 'delivered', 'completed'];
    if (postAcceptanceStates.includes(hiring.status?.code)) {
      return "N/A";
    }
    
    if (isExpired(hiring)) {
      return <span className="text-red-600 font-medium">Vencida</span>;
    }
    
    const daysLeft = calculateDaysLeft(hiring);
    if (daysLeft === "N/A") return "N/A";
    
    return `${daysLeft} días`;
  };

  // Función para verificar si tiene acciones disponibles (basado en availableActions)
  const hasActions = (hiring) => {
    // Si está terminado por moderación, no permitir acciones
    if (isTerminatedByModeration(hiring.status?.code)) {
      return false;
    }
    
    const hasAvailableActions = hiring.availableActions && hiring.availableActions.length > 0;
    return hasAvailableActions;
  };

  // Función para verificar si puede crear claim
  const canCreateClaim = (hiring) => {
    // No permitir reclamos en contrataciones terminadas por moderación
    if (isTerminatedByModeration(hiring.status?.code)) {
      return false;
    }
    
    const ALLOWED_CLAIM_STATES = ['in_progress', 'approved', 'revision_requested', 'delivered', 'completed'];
    const isInClaimAllowedState = ALLOWED_CLAIM_STATES.includes(hiring.status?.code);
    
    if (!isInClaimAllowedState) return false;
    
    // Verificar si el usuario es parte de la contratación
    const isClient = !!(hiring.requestedBy?.id === user?.id || hiring.clientId === user?.id || hiring.client?.id === user?.id || hiring.userId === user?.id);
    const isProvider = !!(hiring.service?.owner?.id === user?.id || hiring.service?.ownerId === user?.id || hiring.providerId === user?.id);
    
    return isClient || isProvider;
  };

  // Función para verificar si puede hacer reseña
  const canReview = (hiring) => {
    const REVIEWABLE_STATES = ['completed', 'completed_by_claim', 'completed_with_agreement'];
    // Solo puede hacer reseña si el estado es reviewable Y no ha hecho reseña aún
    return REVIEWABLE_STATES.includes(hiring.status?.code) && !hiring.hasReview;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con título centrado y botón atrás */}
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-6">
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
                Mis solicitudes
              </h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-500" />
                <span className="font-medium text-gray-700">Filtros:</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => loadMyHirings(filters)}
                  className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition"
                >
                  Reintentar
                </button>
              </div>
            ) : hirings.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes solicitudes
                </h3>
                <p className="text-gray-500 mb-4">
                  {filters.status ? 'No hay solicitudes con el estado seleccionado.' : 'Aún no has realizado ninguna solicitud de contratación.'}
                </p>
                <button
                  onClick={() => router.push('/services')}
                  className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition"
                >
                  Explorar servicios
                </button>
              </div>
            ) : (
              <>
                {/* Tabla para desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mi solicitud
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cotización
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vigencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hirings.map((hiring) => (
                        <tr key={hiring.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 truncate max-w-xs">
                                {hiring.service?.title}
                              </span>
                              <span className="text-sm text-gray-500">
                                ${hiring.service?.price?.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p
                              className="text-sm text-gray-900 max-w-48 break-words line-clamp-2"
                              title={hiring.description}
                            >
                              {hiring.description}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(hiring.status?.code)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(hiring.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {hiring.quotedPrice ? (
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-medium text-conexia-green">
                                    ${parseFloat(hiring.quotedPrice).toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock size={12} />
                                    {hiring.estimatedHours}{getUnitAbbr(hiring.estimatedTimeUnit)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {hiring.paymentModality?.name || 'Pago completo'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Pendiente</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {getVigencyDisplay(hiring)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border">
                                {/* Botón para ver detalle de solicitud */}
                                <button
                                  onClick={() => handleViewRequestDetail(hiring)}
                                  className="flex items-center justify-center w-9 h-9 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                  title="Ver detalles de mi solicitud"
                                  aria-label="Ver detalles de mi solicitud"
                                  data-action="ver-detalle"
                                >
                                  <FaRegEye className="text-[16px] group-hover:scale-110 transition-transform" />
                                </button>
                                
                                {/* Botón para ver servicio */}
                                <button
                                  onClick={() => router.push(`/services/${hiring.service.id}`)}
                                  className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                                  title="Ver servicio"
                                  aria-label="Ver servicio"
                                  data-action="ver-servicio"
                                >
                                  <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
                                </button>

                                {/* Botón Realizar Reclamo */}
                                {canCreateClaim(hiring) && (
                                  <button
                                    onClick={() => handleOpenClaimModal(hiring)}
                                    className="flex items-center justify-center w-9 h-9 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-md transition-all duration-200 group"
                                    title="Realizar reclamo"
                                    aria-label="Realizar reclamo"
                                    data-action="realizar-reclamo"
                                  >
                                    <AlertCircle size={18} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Realizar Reseña */}
                                {canReview(hiring) && (
                                  <button
                                    onClick={() => handleOpenReviewModal(hiring)}
                                    className="flex items-center justify-center w-9 h-9 text-amber-500 hover:text-white hover:bg-amber-500 rounded-md transition-all duration-200 group"
                                    title="Realizar reseña del servicio"
                                    aria-label="Realizar reseña"
                                    data-action="realizar-resena"
                                  >
                                    <FaStar className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Ver Reclamo - Cuando está en estado in_claim */}
                                {hiring.status?.code === 'in_claim' && hiring.claimId && (
                                  <button
                                    onClick={() => router.push(`/claims/my-claims?claimId=${hiring.claimId}`)}
                                    className="flex items-center justify-center w-9 h-9 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                    title="Ver en Mis Reclamos"
                                    aria-label="Ver en Mis Reclamos"
                                    data-action="ver-mis-reclamos"
                                  >
                                    <AlertCircle size={18} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                {canViewQuotation(hiring) && (
                                  <button
                                    onClick={() => handleViewQuotation(hiring)}
                                    className="flex items-center justify-center w-9 h-9 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group"
                                    title="Ver cotización"
                                    aria-label="Ver cotización"
                                    data-action="ver-cotizacion"
                                  >
                                    <FaFileInvoiceDollar className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Ver Entregables - Para contratos aprobados, entregados o terminados por moderación con by_deliverables */}
                                {(['approved', 'in_progress', 'delivered', 'revision_requested', 'completed', 'terminated_by_moderation', 'finished_by_moderation'].includes(hiring.status?.code)) && 
                                 hiring.paymentModality?.code === 'by_deliverables' && (
                                  <button
                                    onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                                    className="flex items-center justify-center w-9 h-9 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                    title="Ver entregables del servicio"
                                    aria-label="Ver entregables"
                                    data-action="ver-entregables"
                                  >
                                    <Package size={18} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Ver Entrega - Para contratos entregados o terminados por moderación con full_payment */}
                                {(['in_progress', 'delivered', 'completed', 'terminated_by_moderation', 'finished_by_moderation'].includes(hiring.status?.code)) && 
                                 hiring.paymentModality?.code === 'full_payment' && (
                                  <button
                                    onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                                    className="flex items-center justify-center w-9 h-9 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                    title="Ver entrega del servicio"
                                    aria-label="Ver entrega"
                                    data-action="ver-entrega"
                                  >
                                    <Package size={18} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                {hasActions(hiring) && (
                                  <button
                                    onClick={() => handleOpenActions(hiring)}
                                    className="flex items-center justify-center w-9 h-9 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                    title="Más acciones"
                                    aria-label="Más acciones"
                                    data-action="mas-acciones"
                                  >
                                    <FaEllipsisH className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                {/* Botón de contratar servicio destacado */}
                                <ContractServiceButton 
                                  serviceHiring={hiring}
                                  onContractSuccess={handleContractSuccess}
                                  highlight
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards para mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {hirings.map((hiring) => (
                    <div key={hiring.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 break-words">
                            {hiring.service?.title}
                          </h3>
                          <p className="text-sm text-conexia-green font-medium">
                            ${hiring.service?.price?.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(hiring.status?.code)}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Mi solicitud:</p>
                        <p className="text-sm text-gray-900 break-words whitespace-pre-line">{hiring.description}</p>
                      </div>
                      
                      {!hiring.quotedPrice && (
                        <div className="mb-3 p-2 bg-gray-50 rounded border">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Estado: Pendiente de cotización</span>
                          </div>
                        </div>
                      )}
                      
                      {hiring.quotedPrice && (
                        <div className="mb-3 p-2 bg-white rounded border">
                          <p className="text-sm text-gray-600 mb-1">Cotización:</p>
                          <div className="flex flex-col">
                            <span className="font-medium text-conexia-green">
                              ${parseFloat(hiring.quotedPrice).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              por {hiring.service?.timeUnit ? getUnitLabel(hiring.service.timeUnit) : 'unidad'}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Vigencia: {getVigencyDisplay(hiring)}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {formatDate(hiring.createdAt)}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                            <button
                              onClick={() => handleViewRequestDetail(hiring)}
                              className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                              title="Ver detalles"
                              aria-label="Ver detalles"
                              data-action="ver-detalle"
                            >
                              <FaRegEye className="text-[15px] group-hover:scale-110 transition-transform" />
                            </button>
                            
                            <button
                              onClick={() => router.push(`/services/${hiring.service.id}`)}
                              className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                              title="Ver servicio"
                              aria-label="Ver servicio"
                              data-action="ver-servicio"
                            >
                              <Briefcase size={15} className="group-hover:scale-110 transition-transform" />
                            </button>

                            {/* Botón Realizar Reclamo Mobile */}
                            {canCreateClaim(hiring) && (
                              <button
                                onClick={() => handleOpenClaimModal(hiring)}
                                className="flex items-center justify-center w-8 h-8 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-md transition-all duration-200 group"
                                title="Realizar reclamo"
                                aria-label="Realizar reclamo"
                                data-action="realizar-reclamo"
                              >
                                <AlertCircle size={16} className="group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            {/* Botón Realizar Reseña Mobile */}
                            {canReview(hiring) && (
                              <button
                                onClick={() => handleOpenReviewModal(hiring)}
                                className="flex items-center justify-center w-8 h-8 text-amber-500 hover:text-white hover:bg-amber-500 rounded-md transition-all duration-200 group"
                                title="Realizar reseña del servicio"
                                aria-label="Realizar reseña"
                                data-action="realizar-resena"
                              >
                                <FaStar className="text-[16px] group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            {/* Botón Ver Reclamo Mobile - Cuando está en estado in_claim */}
                            {hiring.status?.code === 'in_claim' && hiring.claimId && (
                              <button
                                onClick={() => router.push(`/claims/my-claims?claimId=${hiring.claimId}`)}
                                className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                title="Ver en Mis Reclamos"
                                aria-label="Ver en Mis Reclamos"
                                data-action="ver-mis-reclamos"
                              >
                                <AlertCircle size={16} className="group-hover:scale-110 transition-transform" />
                              </button>
                            )}
                            
                            {canViewQuotation(hiring) && (
                              <button
                                onClick={() => handleViewQuotation(hiring)}
                                className="flex items-center justify-center w-8 h-8 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group"
                                title="Ver cotización"
                                aria-label="Ver cotización"
                                data-action="ver-cotizacion"
                              >
                                <FaFileInvoiceDollar className="text-[16px] group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            {/* Botón Ver Entregables - Para contratos aprobados, entregados o terminados por moderación con by_deliverables */}
                            {(['approved', 'in_progress', 'delivered', 'completed', 'terminated_by_moderation', 'finished_by_moderation'].includes(hiring.status?.code)) && 
                             hiring.paymentModality?.code === 'by_deliverables' && (
                              <button
                                onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                                className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                title="Ver entregables"
                                aria-label="Ver entregables"
                                data-action="ver-entregables"
                              >
                                <Package size={16} className="group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            {/* Botón Ver Entrega - Para contratos entregados o terminados por moderación con full_payment */}
                            {(['in_progress', 'delivered', 'completed', 'terminated_by_moderation', 'finished_by_moderation'].includes(hiring.status?.code)) && 
                             hiring.paymentModality?.code === 'full_payment' && (
                              <button
                                onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                                className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                title="Ver entrega"
                                aria-label="Ver entrega"
                                data-action="ver-entrega"
                              >
                                <Package size={16} className="group-hover:scale-110 transition-transform" />
                              </button>
                            )}

                            {/* Botón de pago/contratar dentro de la misma caja de acciones (solo si aplica) */}
                            <ContractServiceButton 
                              serviceHiring={hiring}
                              onContractSuccess={handleContractSuccess}
                              highlight
                              size="sm"
                            />
                            
                            {hasActions(hiring) && (
                              <button
                                onClick={() => handleOpenActions(hiring)}
                                className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                title="Más acciones"
                                aria-label="Más acciones"
                                data-action="mas-acciones"
                              >
                                <FaEllipsisH className="text-[16px] group-hover:scale-110 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                    <Pagination
                      currentPage={pagination.currentPage || 1}
                      page={pagination.currentPage || 1}
                      totalPages={pagination.totalPages || 1}
                      hasNextPage={pagination.hasNextPage || false}
                      hasPreviousPage={pagination.hasPreviousPage || false}
                      onPageChange={handlePageChange}
                    />
                  </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      <QuotationModal
        hiring={selectedHiring}
        isOpen={showQuotationModal}
        onClose={() => {
          setShowQuotationModal(false);
          setSelectedHiring(null);
        }}
        onSuccess={handleActionSuccess}
        onError={handleActionError}
      />

      <ServiceHiringActionsModal
        hiring={selectedHiring}
        isOpen={showActionsModal}
        onClose={() => {
          setShowActionsModal(false);
          setSelectedHiring(null);
        }}
        onSuccess={handleActionSuccess}
        onError={handleActionError}
      />

      <RequestDetailModal
        hiring={selectedHiring}
        isOpen={showRequestDetailModal}
        onClose={() => {
          setShowRequestDetailModal(false);
          setSelectedHiring(null);
        }}
      />

      {/* Modal de Claims */}
      {claimHiring && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => {
            setIsClaimModalOpen(false);
            setClaimHiring(null);
          }}
          hiringId={claimHiring.id}
          isClient={true}
          token={token}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Modal de Reseña */}
      {reviewHiring && (
        <ServiceReviewModal
          hiring={reviewHiring}
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewHiring(null);
          }}
          onSuccess={handleReviewSuccess}
          onError={handleReviewError}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </>
  );
}