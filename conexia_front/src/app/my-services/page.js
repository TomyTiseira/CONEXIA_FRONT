'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { ArrowLeft, Package, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import DeliveryModal from '@/components/deliveries/DeliveryModal';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabelPlural } from '@/utils/timeUnit';
import { ClaimModal } from '@/components/claims/ClaimModal';
import { useUserStore } from '@/store/userStore';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'approved', label: 'Aprobados (listos para entregar)' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'delivered', label: 'Entregados' },
  { value: 'revision_requested', label: 'Revisión solicitada' },
  { value: 'completed', label: 'Completados' },
  { value: 'in_claim', label: 'En reclamo' },
  { value: 'cancelled_by_claim', label: 'Cancelados por reclamo' },
  { value: 'completed_by_claim', label: 'Finalizados por reclamo' },
  { value: 'completed_with_agreement', label: 'Finalizados con acuerdo' }
];

export default function MyServicesPage() {
  const router = useRouter();
  const { user, token } = useUserStore();
  const {
    hirings,
    pagination,
    loading,
    error,
    loadMyServiceRequests // Este hook ya existe y trae servicios donde soy prestador
  } = useServiceHirings();

  const [filters, setFilters] = useState({
    status: '',
    page: 1
  });

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedHiring, setSelectedHiring] = useState(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimHiring, setClaimHiring] = useState(null);

  useEffect(() => {
    loadMyServiceRequests(filters);
  }, [filters, loadMyServiceRequests]);

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (e) => {
    setFilters({ status: e.target.value, page: 1 });
  };

  const handleViewDeliverables = (hiringId) => {
    router.push(`/deliveries/${hiringId}`);
  };

  const handleDeliverService = (hiring) => {
    setSelectedHiring(hiring);
    setShowDeliveryModal(true);
  };

  const handleDeliverySuccess = () => {
    // Recargar la lista después de entregar
    loadMyServiceRequests(filters);
    setShowDeliveryModal(false);
    setSelectedHiring(null);
  };

  const handleOpenClaimModal = (hiring) => {
    setClaimHiring(hiring);
    setIsClaimModalOpen(true);
  };

  const handleClaimSuccess = () => {
    loadMyServiceRequests(filters);
    setIsClaimModalOpen(false);
    setClaimHiring(null);
  };

  const canDeliver = (hiring) => {
    return hiring.status?.code === 'approved';
  };

  const canCreateClaim = (hiring) => {
    const ALLOWED_CLAIM_STATES = ['in_progress', 'approved', 'revision_requested', 'delivered'];
    const isInClaimAllowedState = ALLOWED_CLAIM_STATES.includes(hiring.status?.code);
    
    if (!isInClaimAllowedState) return false;
    
    // Como proveedor, verificar si el usuario es owner del servicio
    const isProvider = !!(hiring.service?.owner?.id === user?.id || hiring.service?.ownerId === user?.id || hiring.providerId === user?.id);
    
    return isProvider;
  };

  const getDeliveryButton = (hiring) => {
    if (!canDeliver(hiring)) {
      return null;
    }

    const isByDeliverables = hiring.paymentModality?.code === 'by_deliverables';

    if (isByDeliverables) {
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleViewDeliverables(hiring.id)}
          className="whitespace-nowrap"
        >
          <Package size={16} className="mr-1" />
          Ver Entregables
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        onClick={() => handleDeliverService(hiring)}
        className="whitespace-nowrap"
      >
        <FileText size={16} className="mr-1" />
        Entregar Servicio
      </Button>
    );
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
              Mis Servicios Contratados
            </h1>
            <p className="text-gray-600 mt-2">
              Servicios donde soy el prestador
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
                No tienes servicios contratados
              </h3>
              <p className="text-gray-600">
                {filters.status 
                  ? 'No hay servicios con el estado seleccionado.' 
                  : 'Aún no tienes servicios donde seas el prestador.'}
              </p>
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
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modalidad
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
                    {hirings.map((hiring) => (
                      <tr key={hiring.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
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
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {getUserDisplayName(hiring.client)}
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
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {hiring.paymentModality?.name || 'No especificada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={hiring.status?.code} type="hiring" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {canCreateClaim(hiring) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleOpenClaimModal(hiring)}
                                className="whitespace-nowrap"
                              >
                                <AlertCircle size={16} className="mr-1" />
                                Realizar Reclamo
                              </Button>
                            )}
                            {getDeliveryButton(hiring)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet: Cards */}
              <div className="lg:hidden space-y-4">
                {hirings.map((hiring) => (
                  <div key={hiring.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {hiring.service?.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Cliente: {getUserDisplayName(hiring.client)}
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
                      <div className="col-span-2">
                        <span className="text-gray-500">Modalidad:</span>
                        <p className="text-sm">
                          {hiring.paymentModality?.name || 'No especificada'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {getDeliveryButton(hiring)}
                    </div>
                  </div>
                ))}
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

      {/* Modal de Entrega */}
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        hiringId={selectedHiring?.id}
        totalPrice={selectedHiring?.quotedPrice}
        onSuccess={handleDeliverySuccess}
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
          isClient={false}
          token={token}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}
