'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { useQuotationErrorHandler } from '@/hooks/service-hirings/useQuotationErrorHandler';
import { fetchServiceDetail } from '@/service/services/servicesFetch';
import { ArrowLeft, User, Calendar, DollarSign, Clock, Edit, Plus, Package, Upload, Eye, AlertCircle } from 'lucide-react';
import { FaFileInvoiceDollar, FaRegEye} from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import QuotationFormModal from '@/components/services/QuotationFormModal';
import PaymentAccountRequiredModal from '@/components/services/PaymentAccountRequiredModal';
import UserBannedModal from '@/components/services/UserBannedModal';
import ProviderRequestDetailModal from '@/components/services/ProviderRequestDetailModal';
import DeliveryModal from '@/components/deliveries/DeliveryModal';
import ClaimModal from '@/components/claims/ClaimModal';
import Toast from '@/components/ui/Toast';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabel } from '@/utils/timeUnit';
import { useUserStore } from '@/store/userStore';
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

export default function ServiceRequestsPage({ serviceId }) {
  // Abreviaturas para las unidades de tiempo (horas, días, semanas, meses)
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
    loadMyServiceRequests
  } = useServiceHirings();
  
  const {
    showPaymentAccountModal,
    showUserBannedModal,
    handleQuotationError: handleSpecificQuotationError,
    closePaymentAccountModal,
    closeUserBannedModal
  } = useQuotationErrorHandler();

  const [service, setService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    serviceId: parseInt(serviceId)
  });
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedHiring, setSelectedHiring] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedHiringForDelivery, setSelectedHiringForDelivery] = useState(null);
  const [toast, setToast] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimHiring, setClaimHiring] = useState(null);

  useEffect(() => {
    loadServiceDetail();
  }, [serviceId]);

  useEffect(() => {
    loadMyServiceRequests(filters);
  }, [filters, loadMyServiceRequests]);

  const loadServiceDetail = async () => {
    setServiceLoading(true);
    try {
      const serviceData = await fetchServiceDetail(serviceId);
      setService(serviceData);
    } catch (err) {
      console.error('Error loading service detail:', err);
      setToast({
        type: 'error',
        message: 'Error al cargar los detalles del servicio',
        isVisible: true
      });
    } finally {
      setServiceLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleCreateQuotation = (hiring) => {
    setSelectedHiring(hiring);
    setIsEditing(false);
    setShowQuotationModal(true);
  };

  const handleEditQuotation = (hiring) => {
    setSelectedHiring(hiring);
    setIsEditing(true);
    setShowQuotationModal(true);
  };

  const handleQuotationSuccess = (message) => {
    setToast({
      type: 'success',
      message: message,
      isVisible: true
    });
    // Recargar datos
    loadMyServiceRequests(filters);
  };

  const handleQuotationError = (message) => {
    setToast({
      type: 'error',
      message: message,
      isVisible: true
    });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCreateQuote = (hiring) => {
    return hiring.availableActions?.includes('quote') || hiring.status?.code === 'pending';
  };

  const canEditQuote = (hiring) => {
    return hiring.availableActions?.includes('edit') || 
           (hiring.quotedPrice && ['quoted', 'negotiating', 'requoting'].includes(hiring.status?.code));
  };

  const handleDeliveryClick = (hiring) => {
    setSelectedHiringForDelivery(hiring);
    setShowDeliveryModal(true);
  };

  const handleDeliverySuccess = () => {
    setShowDeliveryModal(false);
    setSelectedHiringForDelivery(null);
    setToast({
      type: 'success',
      message: 'Entrega realizada exitosamente',
      isVisible: true
    });
    // Recargar las solicitudes para reflejar el cambio
    loadMyServiceRequests(filters);
  };

  const handleOpenClaimModal = (hiring) => {
    setClaimHiring(hiring);
    setIsClaimModalOpen(true);
  };

  const handleClaimSuccess = () => {
    setToast({
      type: 'success',
      message: 'Reclamo creado exitosamente',
      isVisible: true
    });
    setIsClaimModalOpen(false);
    setClaimHiring(null);
    // Recargar datos
    loadMyServiceRequests(filters);
  };

  // Función para verificar si puede crear claim (como proveedor)
  const canCreateClaim = (hiring) => {
    // No permitir reclamos en contrataciones terminadas por moderación
    if (isTerminatedByModeration(hiring.status?.code)) {
      return false;
    }
    
    const ALLOWED_CLAIM_STATES = ['in_progress', 'approved', 'revision_requested', 'delivered', 'completed'];
    const isInClaimAllowedState = ALLOWED_CLAIM_STATES.includes(hiring.status?.code);
    
    if (!isInClaimAllowedState) {
      return false;
    }
    
    // Como proveedor, el userId del user actual debe coincidir con el serviceId owner
    // En ServiceRequestsPage, si estamos viendo las solicitudes de un servicio,
    // significa que YA somos el dueño del servicio (service.owner.id === user.id)
    // Entonces simplemente verificamos que el service pertenece al usuario actual
    
    const userId = user?.id;
    
    // En esta página, service es el servicio cargado al inicio
    // y todos los hirings son de ESTE servicio que nos pertenece
    const serviceOwnerId = service?.owner?.id;
    
    return serviceOwnerId === userId;
  };


  if (serviceLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-conexia-green" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-conexia-green">Solicitudes del Servicio</h1>
            </div>
          </div>

          {/* Información del servicio */}
          {service && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="max-w-xs">
                    <h3 className="font-medium text-gray-900 truncate" title={service.title}>
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500">{service.category?.name}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Precio Base</p>
                  <p className="text-xl font-bold text-conexia-green">
                    ${service.price?.toLocaleString()}{service.timeUnit ? ` por ${getUnitLabel(service.timeUnit)}` : ''}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Solicitudes</p>
                  <p className="text-xl font-bold text-gray-900">{pagination.totalItems || 0}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-xl font-bold text-orange-600">
                    {hirings.filter(h => h.status?.code === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">Filtrar por estado:</span>
              </div>
              
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

          {/* Lista de solicitudes */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => loadMyServiceRequests(filters)}
                  className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition"
                >
                  Reintentar
                </button>
              </div>
            ) : hirings.length === 0 ? (
              <div className="text-center py-12">
                <User size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes
                </h3>
                <p className="text-gray-500">
                  {filters.status ? 'No hay solicitudes con el estado seleccionado.' : 'Aún no has recibido solicitudes para este servicio.'}
                </p>
              </div>
            ) : (
              <>
                {/* Tabla para desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Solicitud
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mi Cotización
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {hirings.map((hiring) => (
                        <tr key={hiring.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {getUserDisplayName({ name: hiring.name, lastName: hiring.lastName }) || `Cliente #${hiring.userId}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900 max-w-xs truncate" title={hiring.description}>
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
                                    ${hiring.quotedPrice.toLocaleString()}
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
                              <span className="text-sm text-gray-500">Sin cotizar</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end">
                              <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border gap-0.5">
                                {/* Botón para ver detalle de solicitud */}
                                <button
                                  onClick={() => setSelectedRequest(hiring)}
                                  className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                  title="Ver detalles de la solicitud"
                                >
                                  <FaRegEye className="text-[16px] group-hover:scale-110 transition-transform" />
                                </button>
                                
                                {/* Botón Claims */}
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

                                {/* Botón Ver Reclamo - Cuando está en estado in_claim */}
                                {hiring.status?.code === 'in_claim' && hiring.claimId && (
                                  <button
                                    onClick={() => router.push(`/claims/${hiring.claimId}`)}
                                    className="flex items-center justify-center w-8 h-8 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                                    title="Ver reclamo activo"
                                    aria-label="Ver reclamo"
                                    data-action="ver-reclamo"
                                  >
                                    <AlertCircle size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                {canCreateQuote(hiring) && !hiring.quotedPrice && (
                                  <button
                                    onClick={() => handleCreateQuotation(hiring)}
                                    className="flex items-center justify-center w-8 h-8 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group"
                                    title="Crear cotización para esta solicitud"
                                  >
                                    <Plus size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                {canEditQuote(hiring) && hiring.quotedPrice && (
                                  <button
                                    onClick={() => handleEditQuotation(hiring)}
                                    className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                    title="Editar cotización existente"
                                  >
                                    <Edit size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Ver Entregables - Para contratos aprobados, entregados o en revisión con by_deliverables */}
                                {(['approved', 'in_progress', 'delivered', 'revision_requested'].includes(hiring.status?.code)) && 
                                 hiring.paymentModality?.code === 'by_deliverables' && (
                                  <button
                                    onClick={() => router.push(`/deliveries/${hiring.id}`)}
                                    className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                    title="Ver entregables del servicio"
                                  >
                                    <Package size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Realizar entrega - Para contratos aprobados o en revisión con full_payment */}
                                {(['approved', 'in_progress', 'revision_requested'].includes(hiring.status?.code)) && hiring.paymentModality?.code === 'full_payment' && (
                                  <button
                                    onClick={() => handleDeliveryClick(hiring)}
                                    className="flex items-center justify-center w-8 h-8 text-green-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-200 group"
                                    title={hiring.status?.code === 'revision_requested' ? 'Re-subir entrega corregida' : 'Realizar entrega del servicio'}
                                  >
                                    <Upload size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}

                                {/* Botón Ver Entrega - Para contratos entregados o en revisión con full_payment */}
                                {(['in_progress', 'delivered', 'revision_requested'].includes(hiring.status?.code)) && hiring.paymentModality?.code === 'full_payment' && (
                                  <button
                                    onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                                    className="flex items-center justify-center w-8 h-8 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                                    title="Ver entrega del servicio"
                                  >
                                    <Package size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => router.push(`/profile/userProfile/${hiring.userId}`)}
                                  className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                                  title="Ver perfil del cliente"
                                >
                                  <User size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cards para mobile y tablet */}
                <div className="lg:hidden space-y-4 p-4">
                  {hirings.map((hiring) => (
                    <div key={hiring.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {getUserDisplayName({ name: hiring.name, lastName: hiring.lastName }) || `Cliente #${hiring.userId}`}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(hiring.createdAt)}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(hiring.status?.code)}
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Solicitud:</p>
                        <p className="text-sm text-gray-900">{hiring.description}</p>
                      </div>
                      
                      {hiring.quotedPrice && (
                        <div className="mb-3 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600 mb-1">Mi cotización:</p>
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-conexia-green">
                                  ${hiring.quotedPrice.toLocaleString()}
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
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200 gap-0.5">
                          <button
                            onClick={() => setSelectedRequest(hiring)}
                            className="flex items-center justify-center w-7 h-7 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                            title="Ver detalles de la solicitud"
                          >
                            <FaRegEye className="text-[14px] group-hover:scale-110 transition-transform" />
                          </button>
                          
                          {/* Botón Claims Mobile */}
                          {canCreateClaim(hiring) && (
                            <button
                              onClick={() => handleOpenClaimModal(hiring)}
                              className="flex items-center justify-center w-7 h-7 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-md transition-all duration-200 group"
                              title="Realizar reclamo"
                              aria-label="Realizar reclamo"
                              data-action="realizar-reclamo"
                            >
                              <AlertCircle size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          {/* Botón Ver Reclamo Mobile - Cuando está en estado in_claim */}
                          {hiring.status?.code === 'in_claim' && hiring.claimId && (
                            <button
                              onClick={() => router.push(`/claims/${hiring.claimId}`)}
                              className="flex items-center justify-center w-7 h-7 text-orange-600 hover:text-white hover:bg-orange-600 rounded-md transition-all duration-200 group"
                              title="Ver reclamo activo"
                              aria-label="Ver reclamo"
                              data-action="ver-reclamo"
                            >
                              <AlertCircle size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                          
                          {canCreateQuote(hiring) && !hiring.quotedPrice && (
                            <button
                              onClick={() => handleCreateQuotation(hiring)}
                              className="flex items-center justify-center w-7 h-7 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group"
                              title="Crear cotización"
                            >
                              <Plus size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                          
                          {canEditQuote(hiring) && hiring.quotedPrice && (
                            <button
                              onClick={() => handleEditQuotation(hiring)}
                              className="flex items-center justify-center w-7 h-7 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                              title="Editar cotización"
                            >
                              <Edit size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          {/* Botón Ver Entregables - Para contratos aprobados, entregados o en revisión con by_deliverables */}
                          {(['approved', 'in_progress', 'delivered', 'revision_requested'].includes(hiring.status?.code)) && 
                           hiring.paymentModality?.code === 'by_deliverables' && (
                            <button
                              onClick={() => router.push(`/deliveries/${hiring.id}`)}
                              className="flex items-center justify-center w-7 h-7 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                              title="Ver entregables"
                            >
                              <Package size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          {/* Botón Realizar entrega - Para contratos aprobados o en revisión con full_payment */}
                          {(['approved', 'in_progress', 'revision_requested'].includes(hiring.status?.code)) && hiring.paymentModality?.code === 'full_payment' && (
                            <button
                              onClick={() => handleDeliveryClick(hiring)}
                              className="flex items-center justify-center w-7 h-7 text-green-600 hover:text-white hover:bg-green-600 rounded-md transition-all duration-200 group"
                              title={hiring.status?.code === 'revision_requested' ? 'Re-subir entrega' : 'Realizar entrega'}
                            >
                              <Upload size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}

                          {/* Botón Ver Entrega - Para contratos entregados o en revisión con full_payment */}
                          {(['in_progress', 'delivered', 'revision_requested'].includes(hiring.status?.code)) && hiring.paymentModality?.code === 'full_payment' && (
                            <button
                              onClick={() => router.push(`/service-delivery/${hiring.id}`)}
                              className="flex items-center justify-center w-7 h-7 text-purple-600 hover:text-white hover:bg-purple-600 rounded-md transition-all duration-200 group"
                              title="Ver entrega"
                            >
                              <Package size={14} className="group-hover:scale-110 transition-transform" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => router.push(`/profile/userProfile/${hiring.userId}`)}
                            className="flex items-center justify-center w-7 h-7 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                            title="Ver perfil"
                          >
                            <User size={14} className="group-hover:scale-110 transition-transform" />
                          </button>
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

      {/* Modal de cotización */}
      <QuotationFormModal
        hiring={selectedHiring}
        isOpen={showQuotationModal}
        isEditing={isEditing}
        onClose={() => {
          setShowQuotationModal(false);
          setSelectedHiring(null);
          setIsEditing(false);
        }}
        onSuccess={handleQuotationSuccess}
        onError={handleQuotationError}
      />

      {/* Modal de detalle de solicitud */}
      <ProviderRequestDetailModal
        hiring={selectedRequest}
        isOpen={!!selectedRequest}
        clientName={selectedRequest?.name}
        clientLastName={selectedRequest?.lastName}
        onClose={() => setSelectedRequest(null)}
      />

      {/* Modal de entrega para servicios de pago total */}
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => {
          setShowDeliveryModal(false);
          setSelectedHiringForDelivery(null);
        }}
        hiringId={selectedHiringForDelivery?.id}
        totalPrice={selectedHiringForDelivery?.quotedPrice}
        onSuccess={handleDeliverySuccess}
      />

      {/* Modales de validación específicos */}
      <PaymentAccountRequiredModal
        isOpen={showPaymentAccountModal}
        onClose={closePaymentAccountModal}
      />

      <UserBannedModal
        isOpen={showUserBannedModal}
        onClose={closeUserBannedModal}
        onAccept={() => {
          // En este contexto, el usuario ya está viendo las solicitudes
          // por lo que no necesitamos actualizar estado específico
        }}
      />

      {/* Modal de Reclamos */}
      {claimHiring && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => {
            setIsClaimModalOpen(false);
            setClaimHiring(null);
          }}
          hiringId={claimHiring.id}
          isClient={false}
          token={token}
          onSuccess={handleClaimSuccess}
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