'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHiringWithDeliveries } from '@/hooks/deliveries';
import { ArrowLeft, Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Upload, Eye } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import DeliveryModal from '@/components/deliveries/DeliveryModal';
import { getUserDisplayName } from '@/utils/formatUserName';

export default function DeliverablesPage() {
  const router = useRouter();
  const params = useParams();
  const hiringId = parseInt(params.hiringId);

  const { hiring, loading: hiringLoading, loadHiring } = useHiringWithDeliveries(hiringId);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);

  useEffect(() => {
    if (hiringId) {
      loadHiring();
    }
  }, [hiringId, loadHiring]);

  const deliverables = hiring?.deliverables || [];

  const handleOpenDeliveryModal = (deliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDeliveryModal(true);
  };

  const handleDeliverySuccess = () => {
    // Recargar datos después de entregar
    loadHiring();
    setShowDeliveryModal(false);
    setSelectedDeliverable(null);
  };

  const handleViewDelivery = (deliverable) => {
    // TODO: Implementar modal o navegación para ver detalle de la entrega
    // Por ahora redirigimos a la página de revisión del cliente
    router.push(`/service-delivery/${hiringId}`);
  };

  const canDeliverDeliverable = (deliverable) => {
    // Solo se puede entregar si está en estado pendiente o si fue rechazado
    return deliverable.status === 'pending' || deliverable.status === 'revision_requested';
  };

  const getDeliverableProgress = () => {
    if (deliverables.length === 0) return 0;
    const approved = deliverables.filter(d => d.status === 'approved').length;
    return Math.round((approved / deliverables.length) * 100);
  };

  const getTotalDelivered = () => {
    return deliverables
      .filter(d => d.status === 'approved')
      .reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0);
  };

  const getTotalPending = () => {
    return deliverables
      .filter(d => d.status !== 'approved')
      .reduce((sum, d) => sum + (parseFloat(d.price) || 0), 0);
  };

  if (hiringLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando entregables...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!hiring) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Servicio no encontrado
              </h3>
              <Button variant="primary" onClick={() => router.push('/my-services')}>
                Volver a Mis Servicios
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => {
                const serviceId = hiring?.service?.id || hiring?.serviceId;
                if (serviceId) {
                  router.push(`/services/my-services/${serviceId}/requests`);
                } else {
                  router.back();
                }
              }}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Entregables del Servicio
            </h1>
            <p className="text-gray-600 mt-2">
              {hiring.service?.title}
            </p>
          </div>

          {/* Info del servicio */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">
                  {getUserDisplayName(hiring.client)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Precio Total</p>
                <p className="font-semibold text-gray-900 flex items-center">
                  <DollarSign size={16} className="mr-1" />
                  ${((parseFloat(hiring.quotedPrice) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }))}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Entregado</p>
                <p className="font-semibold text-green-600 flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  ${(getTotalDelivered()).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Pendiente</p>
                <p className="font-semibold text-orange-600 flex items-center">
                  <Clock size={16} className="mr-1" />
                  ${(getTotalPending()).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Progreso de Entregas</p>
                <p className="text-sm font-semibold text-conexia-green">
                  {getDeliverableProgress()}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-conexia-green rounded-full h-3 transition-all duration-300"
                  style={{ width: `${getDeliverableProgress()}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {deliverables.filter(d => d.status === 'approved').length} de {deliverables.length} entregables aprobados
              </p>
            </div>
          </div>

          {/* Tabla de entregables */}
          {deliverables.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay entregables definidos
              </h3>
              <p className="text-gray-600">
                Este servicio no tiene entregables configurados.
              </p>
            </div>
          ) : (
            <>
              {/* Vista Desktop: Tabla */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        N°
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Estimada
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
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
                    {deliverables
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((deliverable) => (
                        <tr key={deliverable.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-conexia-green/10 text-conexia-green font-semibold">
                              {deliverable.orderIndex}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {deliverable.title}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {deliverable.description}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar size={16} className="mr-2" />
                              {new Date(deliverable.estimatedDeliveryDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm font-medium text-gray-900">
                              <DollarSign size={16} className="mr-1" />
                              ${deliverable.price?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={deliverable.status} type="deliverable" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              {canDeliverDeliverable(deliverable) ? (
                                <button
                                  onClick={() => handleOpenDeliveryModal(deliverable)}
                                  className="flex items-center justify-center w-8 h-8 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group bg-gray-50 border border-gray-200"
                                  title="Realizar entrega"
                                >
                                  <Upload size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              ) : deliverable.status === 'delivered' ? (
                                <button
                                  onClick={() => handleViewDelivery(deliverable)}
                                  className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group bg-gray-50 border border-gray-200"
                                  title="Ver detalle de la entrega"
                                >
                                  <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              ) : deliverable.status === 'approved' ? (
                                <span className="text-sm text-gray-400 italic">✓ Aprobado</span>
                              ) : (
                                <span className="text-sm text-gray-400 italic">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet: Cards */}
              <div className="lg:hidden space-y-4">
                {deliverables
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map((deliverable) => (
                    <div key={deliverable.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-conexia-green/10 text-conexia-green font-bold">
                            {deliverable.orderIndex}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {deliverable.title}
                            </h3>
                            <StatusBadge status={deliverable.status} type="deliverable" />
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {deliverable.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <p className="font-semibold text-gray-900">
                            ${deliverable.price?.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha estimada:</span>
                          <p className="text-gray-900">
                            {new Date(deliverable.estimatedDeliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {canDeliverDeliverable(deliverable) ? (
                        <button
                          onClick={() => handleOpenDeliveryModal(deliverable)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-all duration-200"
                        >
                          <Upload size={18} />
                          Entregar
                        </button>
                      ) : deliverable.status === 'delivered' ? (
                        <button
                          onClick={() => handleViewDelivery(deliverable)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                        >
                          <Eye size={18} />
                          Ver Entrega
                        </button>
                      ) : (
                        <div className="w-full text-center py-2 text-gray-400 italic text-sm">
                          {deliverable.status === 'approved' ? '✓ Aprobado' : 'No disponible'}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de Entrega */}
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        hiringId={hiringId}
        deliverableId={selectedDeliverable?.id}
        deliverableInfo={selectedDeliverable}
        onSuccess={handleDeliverySuccess}
      />
    </>
  );
}
