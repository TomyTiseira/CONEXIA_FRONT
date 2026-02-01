'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { ArrowLeft, Package, Calendar, DollarSign, FileText, Bell, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { ClaimModal } from '@/components/claims';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabelPlural } from '@/utils/timeUnit';
import { useUserStore } from '@/store/userStore';
import Toast from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'approved', label: 'Aprobados' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'revision_requested', label: 'Revisión solicitada' },
  { value: 'completed', label: 'Completados' },
  { value: 'in_claim', label: 'En reclamo' },
  { value: 'cancelled_by_claim', label: 'Cancelados por reclamo' },
  { value: 'completed_by_claim', label: 'Finalizados por reclamo' },
  { value: 'completed_with_agreement', label: 'Finalizados con acuerdo' }
];

export default function RequestedServicesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const {
    hirings,
    pagination,
    loading,
    error,
    loadMyHirings // Hook que trae servicios donde soy cliente
  } = useServiceHirings();

  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });

  const [selectedHiring, setSelectedHiring] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });

  useEffect(() => {
    loadMyHirings(filters);
  }, [filters, loadMyHirings]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (e) => {
    setFilters({ status: e.target.value, page: 1 });
  };

  const handleViewDeliveries = (hiringId) => {
    router.push(`/service-delivery/${hiringId}`);
  };

  const hasNewDeliveries = (hiring) => {
    // TODO: Implementar lógica para detectar deliveries con status 'delivered'
    // Por ahora retornamos false
    return false;
  };

  const getDeliveriesCount = (hiring) => {
    // TODO: Obtener count de deliveries desde el backend
    return 0;
  };

  const getApprovedDeliverables = (hiring) => {
    if (!hiring.deliverables) return 0;
    return hiring.deliverables.filter(d => d.status === 'approved').length;
  };

  const getTotalDeliverables = (hiring) => {
    return hiring.deliverables?.length || 0;
  };

  // Función para verificar si puede crear claim
  const canCreateClaim = (hiring) => {
    const ALLOWED_CLAIM_STATES = ['in_progress', 'approved', 'revision_requested', 'delivered'];
    const isInClaimAllowedState = ALLOWED_CLAIM_STATES.includes(hiring.status?.code);
    
    if (!isInClaimAllowedState) return false;
    
    // Verificar si el usuario es parte de la contratación (en este caso, es el cliente)
    const isClient = !!(hiring.requestedBy?.id === user?.id || hiring.clientId === user?.id || hiring.client?.id === user?.id || hiring.userId === user?.id);
    const isProvider = !!(hiring.service?.owner?.id === user?.id || hiring.service?.ownerId === user?.id || hiring.providerId === user?.id);
    
    return isClient || isProvider;
  };

  // Manejar apertura del modal de reclamo
  const handleOpenClaimModal = (hiring) => {
    setSelectedHiring(hiring);
    setIsClaimModalOpen(true);
  };

  // Manejar éxito de creación de reclamo
  const handleClaimSuccess = () => {
    setIsClaimModalOpen(false);
    setSelectedHiring(null);
    setToast({ isVisible: true, type: 'success', message: 'Reclamo creado exitosamente' });
    // Recargar los hirings
    loadMyHirings(filters);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Servicios Solicitados
            </h1>
            <p className="text-gray-600 mt-2">
              Servicios que he contratado
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-xs">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por estado:
                </label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {pagination.total || 0} servicios
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando servicios...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && hirings.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes servicios solicitados
              </h3>
              <p className="text-gray-600 mb-6">
                {filters.status 
                  ? 'No hay servicios con el estado seleccionado.' 
                  : 'Aún no has contratado ningún servicio.'}
              </p>
              <Button variant="primary" onClick={() => router.push('/services')}>
                Explorar servicios
              </Button>
            </div>
          )}

          {!loading && !error && hirings.length > 0 && (
            <>
              {/* Vista Desktop: Tabla */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Servicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prestador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progreso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {hirings.map((hiring) => {
                      const totalDeliverables = getTotalDeliverables(hiring);
                      const approvedDeliverables = getApprovedDeliverables(hiring);
                      const isByDeliverables = hiring.paymentModality?.code === 'by_deliverables';

                      return (
                        <tr key={hiring.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewDeliveries(hiring.id)}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {hasNewDeliveries(hiring) && (
                                <Bell size={16} className="text-orange-500 mr-2 animate-pulse" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {hiring.service?.title}
                                </div>
                                {hiring.estimatedHours && hiring.estimatedTimeUnit && (
                                  <div className="text-sm text-gray-500">
                                    {hiring.estimatedHours} {getUnitLabelPlural(hiring.estimatedTimeUnit)} estimadas
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {getUserDisplayName(hiring.service?.owner)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={16} className="mr-2" />
                              {new Date(hiring.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <DollarSign size={16} className="mr-1" />
                              ${hiring.quotedPrice?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isByDeliverables && totalDeliverables > 0 ? (
                              <div className="flex items-center">
                                <div className="flex-1 mr-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-conexia-green rounded-full h-2 transition-all"
                                      style={{ width: `${(approvedDeliverables / totalDeliverables) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-xs text-gray-600 whitespace-nowrap">
                                  {approvedDeliverables}/{totalDeliverables}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={hiring.status?.code} type="hiring" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end">
                              <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border gap-0.5">
                                {/* Botón Realizar Reclamo */}
                                {canCreateClaim(hiring) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenClaimModal(hiring);
                                    }}
                                    className="flex items-center justify-center w-8 h-8 text-yellow-600 hover:text-white hover:bg-yellow-600 rounded-md transition-all duration-200 group"
                                    title="Realizar reclamo"
                                    aria-label="Realizar reclamo"
                                    data-action="realizar-reclamo"
                                  >
                                    <AlertCircle size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                )}
                                
                                {/* Botón Ver Entregas */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDeliveries(hiring.id);
                                  }}
                                  className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                  title="Ver entregas"
                                  aria-label="Ver entregas"
                                >
                                  <FileText size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet: Cards */}
              <div className="lg:hidden space-y-4">
                {hirings.map((hiring) => {
                  const totalDeliverables = getTotalDeliverables(hiring);
                  const approvedDeliverables = getApprovedDeliverables(hiring);
                  const isByDeliverables = hiring.paymentModality?.code === 'by_deliverables';

                  return (
                    <div 
                      key={hiring.id} 
                      className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleViewDeliveries(hiring.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {hasNewDeliveries(hiring) && (
                              <Bell size={16} className="text-orange-500 animate-pulse" />
                            )}
                            <h3 className="font-semibold text-gray-900">
                              {hiring.service?.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Prestador: {getUserDisplayName(hiring.service?.owner)}
                          </p>
                        </div>
                        <StatusBadge status={hiring.status?.code} type="hiring" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <p className="font-semibold text-gray-900">
                            ${hiring.quotedPrice?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <p className="text-gray-900">
                            {new Date(hiring.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isByDeliverables && totalDeliverables > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">Progreso:</span>
                            <span className="text-xs font-semibold text-conexia-green">
                              {approvedDeliverables}/{totalDeliverables}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-conexia-green rounded-full h-2 transition-all"
                              style={{ width: `${(approvedDeliverables / totalDeliverables) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {/* Botón Realizar Reclamo Mobile */}
                        {canCreateClaim(hiring) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenClaimModal(hiring);
                            }}
                            className="flex items-center justify-center px-3 py-2 text-yellow-600 border border-yellow-600 hover:text-white hover:bg-yellow-600 rounded-md transition-all duration-200"
                            title="Realizar reclamo"
                            aria-label="Realizar reclamo"
                          >
                            <AlertCircle size={16} className="mr-1" />
                            Reclamo
                          </button>
                        )}

                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDeliveries(hiring.id);
                          }}
                          className="flex-1"
                        >
                          <FileText size={16} className="mr-1" />
                          Ver Entregas
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Reclamo */}
      {selectedHiring && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => {
            setIsClaimModalOpen(false);
            setSelectedHiring(null);
          }}
          hiring={selectedHiring}
          onSuccess={handleClaimSuccess}
        />
      )}

      {/* Toast */}
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        position="top-center"
      />
    </>
  );
}
