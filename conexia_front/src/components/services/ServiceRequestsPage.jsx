'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { useQuotationErrorHandler } from '@/hooks/service-hirings/useQuotationErrorHandler';
import { fetchServiceDetail } from '@/service/services/servicesFetch';
import { ArrowLeft, User, Calendar, DollarSign, Clock, Edit, Plus } from 'lucide-react';
import { FaFileInvoiceDollar, FaRegEye} from 'react-icons/fa';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import QuotationFormModal from '@/components/services/QuotationFormModal';
import PaymentAccountRequiredModal from '@/components/services/PaymentAccountRequiredModal';
import UserBannedModal from '@/components/services/UserBannedModal';
import ProviderRequestDetailModal from '@/components/services/ProviderRequestDetailModal';
import Toast from '@/components/ui/Toast';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabel } from '@/utils/timeUnit';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'quoted', label: 'Cotizado' },
  { value: 'accepted', label: 'Aceptado' },
  { value: 'rejected', label: 'Rechazado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'negotiating', label: 'Negociando' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' }
];

const getStatusBadge = (statusCode) => {
  const statusMap = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-800' },
    quoted: { label: 'Cotizado', className: 'bg-blue-100 text-blue-800' },
    accepted: { label: 'Aceptado', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
    cancelled: { label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
    negotiating: { label: 'Negociando', className: 'bg-orange-100 text-orange-800' },
    in_progress: { label: 'En progreso', className: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Completado', className: 'bg-green-100 text-green-800' }
  };
  
  const status = statusMap[statusCode] || { label: statusCode, className: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
      {status.label}
    </span>
  );
};

export default function ServiceRequestsPage({ serviceId }) {
  const router = useRouter();
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
  const [toast, setToast] = useState(null);

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
           (hiring.quotedPrice && ['quoted', 'negotiating'].includes(hiring.status?.code));
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
                  <div>
                    <h3 className="font-medium text-gray-900">{service.title}</h3>
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
                  <p className="text-xl font-bold text-gray-900">{pagination.total || 0}</p>
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
                              <div className="flex flex-col">
                                <span className="font-medium text-conexia-green">
                                  ${hiring.quotedPrice.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <Clock size={12} />
                                  {hiring.estimatedHours}h
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Sin cotizar</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border">
                                {/* Botón para ver detalle de solicitud */}
                                <button
                                  onClick={() => setSelectedRequest(hiring)}
                                  className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                  title="Ver detalles de la solicitud"
                                >
                                  <FaRegEye className="text-[16px] group-hover:scale-110 transition-transform" />
                                </button>
                                
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
                          <div className="flex justify-between">
                            <span className="font-medium text-conexia-green">
                              ${hiring.quotedPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {hiring.estimatedHours}h
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                          <button
                            onClick={() => setSelectedRequest(hiring)}
                            className="flex items-center justify-center w-7 h-7 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                            title="Ver detalles de la solicitud"
                          >
                            <FaRegEye className="text-[14px] group-hover:scale-110 transition-transform" />
                          </button>
                          
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
                {pagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                    <Pagination
                      currentPage={pagination.page || 1}
                      totalPages={pagination.totalPages || 1}
                      hasNextPage={pagination.hasNext || false}
                      hasPreviousPage={pagination.hasPrev || false}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
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