'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHiringWithDeliveries } from '@/hooks/deliveries';
import { fetchDeliverablesWithValidation } from '@/service/deliveries';
import { Package, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, Upload, Eye, Lock } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui';
import DeliveryModal from '@/components/deliveries/DeliveryModal';
import Toast from '@/components/ui/Toast';
import { getUserDisplayName } from '@/utils/formatUserName';

export default function DeliverablesPage() {
  const router = useRouter();
  const params = useParams();
  const hiringId = parseInt(params.hiringId);

  const { user, isLoading: authLoading } = useAuth();

  const { hiring, loading: hiringLoading, error: hiringError, loadHiring } = useHiringWithDeliveries(hiringId);

  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [toast, setToast] = useState(null);
  // null = chequeando, true/false = resuelto
  const [accessDenied, setAccessDenied] = useState(null);

  useEffect(() => {
    if (hiringId) {
      loadHiring().catch(() => null);
    }
  }, [hiringId, loadHiring]);

  useEffect(() => {
    if (authLoading) return;
    if (!hiring) return;

    const providerId = hiring?.service?.userId || hiring?.service?.owner?.id;
    const isProvider = !!user?.id && !!providerId && user.id === providerId;

    setAccessDenied(!isProvider);
  }, [authLoading, hiring, user]);

  // Cargar entregables con validaciones
  useEffect(() => {
    const loadDeliverablesWithValidation = async () => {
      if (!hiringId || !hiring) return;
      if (authLoading || accessDenied) return;

      setDeliverablesLoading(true);
      try {
        const data = await fetchDeliverablesWithValidation(hiringId);
        setDeliverables(data || []);
      } catch (error) {
        // Evitar ruido en consola para errores esperados (403/404)
        // Fallback a los entregables del hiring si falla
        setDeliverables(hiring?.deliverables || []);
      } finally {
        setDeliverablesLoading(false);
      }
    };

    loadDeliverablesWithValidation();
  }, [hiringId, hiring, authLoading, accessDenied]);

  const handleOpenDeliveryModal = (deliverable) => {
    // Verificar si puede entregar este entregable
    if (deliverable.canDeliver === false) {
      setToast({
        type: 'error',
        message: deliverable.lockReason || 'Debes entregar el entregable anterior primero',
        isVisible: true
      });
      return;
    }

    // Buscar si hay una delivery en revisión para este entregable
    const previousDelivery = hiring?.deliveries?.find(
      d => d.deliverable?.id === deliverable.id && d.status === 'revision_requested'
    );

    setSelectedDeliverable({ 
      ...deliverable, 
      previousDelivery: previousDelivery || null 
    });
    setShowDeliveryModal(true);
  };

  const handleDeliverySuccess = async () => {
    // Recargar datos después de entregar
    await loadHiring();
    
    // Recargar deliverables con validaciones
    try {
      const data = await fetchDeliverablesWithValidation(hiringId);
      setDeliverables(data || []);
    } catch (error) {
      console.error('Error al recargar entregables:', error);
    }

    setShowDeliveryModal(false);
    setSelectedDeliverable(null);
    
    setToast({
      type: 'success',
      message: 'Entrega realizada exitosamente',
      isVisible: true
    });
  };

  const handleViewDelivery = (deliverable) => {
    // TODO: Implementar modal o navegación para ver detalle de la entrega
    // Por ahora redirigimos a la página de revisión del cliente
    router.push(`/service-delivery/${hiringId}`);
  };

  const canDeliverDeliverable = (deliverable) => {
    // Primero verificar la validación del backend
    if (deliverable.canDeliver === false) {
      return false;
    }
    
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
        <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando entregables...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Primer render: todavía no terminó de cargar y no hay error
  if (!hiring && !hiringError) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Cargando entregables..." fullScreen={true} />
      </>
    );
  }

  // Esperar a que cargue auth antes de decidir permisos
  if (authLoading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Cargando..." fullScreen={true} />
      </>
    );
  }

  // Ya tengo el hiring, pero todavía no resolví permisos
  if (hiring && accessDenied === null) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Cargando..." fullScreen={true} />
      </>
    );
  }

  if (hiringError) {
    const statusCode = hiringError?.statusCode || hiringError?.status;
    const title = statusCode === 403
      ? 'Página no encontrada'
      : statusCode === 404
        ? 'Servicio no encontrado'
        : 'No se pudo cargar la página';

    const message = statusCode === 403
      ? 'La página que buscas no existe o no tienes permisos para acceder a ella.'
      : (hiringError?.message || 'Ocurrió un error al cargar la página.');

    return (
      <NotFound
        title={title}
        message={message}
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  // Página solo para prestador: si no coincide, mostrar NotFound
  if (accessDenied) {
    return (
      <NotFound
        title="Página no encontrada"
        message="La página que buscas no existe o no tienes permisos para acceder a ella."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  if (!hiring) {
    return (
      <NotFound
        title="Servicio no encontrado"
        message="La contratación solicitada no existe o no se encuentra disponible."
        showBackButton={true}
        showHomeButton={true}
      />
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con título centrado y botón atrás */}
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const serviceId = hiring?.service?.id || hiring?.serviceId;
                  if (serviceId) {
                    router.push(`/services/my-services/${serviceId}/requests`);
                  } else {
                    router.back();
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Volver atrás"
                aria-label="Volver atrás"
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

              <div className="flex-1 text-center mr-8 min-w-0">
                <h1 className="text-2xl font-bold text-conexia-green">
                  Entregables del servicio
                </h1>
              </div>

              <div className="w-10" />
            </div>
          </div>

          {/* Info del servicio */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-900 break-words">
                {hiring.service?.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Entrega por entregables
              </p>
            </div>

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
                              {/* Botón para Re-entregar cuando está en revisión solicitada o puede entregar */}
                              {canDeliverDeliverable(deliverable) && (
                                <button
                                  onClick={() => handleOpenDeliveryModal(deliverable)}
                                  className="flex items-center justify-center w-8 h-8 text-conexia-green hover:text-white hover:bg-conexia-green rounded-md transition-all duration-200 group bg-gray-50 border border-gray-200"
                                  title={deliverable.status === 'revision_requested' ? 'Re-subir entrega corregida' : 'Realizar entrega'}
                                >
                                  <Upload size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                              
                              {/* Botón para Ver cuando está entregado, aprobado o en revisión */}
                              {(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
                                <button
                                  onClick={() => handleViewDelivery(deliverable)}
                                  className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group bg-gray-50 border border-gray-200"
                                  title="Ver detalle de la entrega"
                                >
                                  <Eye size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                              )}
                              
                              {/* Botón bloqueado cuando no puede entregar y no tiene entrega para ver */}
                              {deliverable.isLocked && !(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
                                <button
                                  disabled
                                  className="flex items-center justify-center w-8 h-8 text-gray-400 cursor-not-allowed rounded-md bg-gray-100 border border-gray-200"
                                  title={deliverable.lockReason || 'Debes entregar el entregable anterior primero'}
                                >
                                  <Lock size={16} />
                                </button>
                              )}
                              
                              {/* Sin acciones disponibles */}
                              {!canDeliverDeliverable(deliverable) && 
                               !deliverable.isLocked && 
                               !(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
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

                      {/* Acciones - Botones de acción */}
                      <div className="flex flex-col gap-2">
                        {/* Botón para Re-entregar */}
                        {canDeliverDeliverable(deliverable) && (
                          <button
                            onClick={() => handleOpenDeliveryModal(deliverable)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-all duration-200"
                          >
                            <Upload size={18} />
                            {deliverable.status === 'revision_requested' ? 'Re-entregar' : 'Entregar'}
                          </button>
                        )}
                        
                        {/* Botón para Ver */}
                        {(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
                          <button
                            onClick={() => handleViewDelivery(deliverable)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                          >
                            <Eye size={18} />
                            Ver Entrega
                          </button>
                        )}
                        
                        {/* Estado bloqueado */}
                        {deliverable.isLocked && !(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
                          <div className="w-full">
                            <button
                              disabled
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                            >
                              <Lock size={18} />
                              Bloqueado
                            </button>
                            <p className="text-xs text-red-600 mt-2 text-center">
                              {deliverable.lockReason}
                            </p>
                          </div>
                        )}
                        
                        {/* Sin acciones disponibles */}
                        {!canDeliverDeliverable(deliverable) && 
                         !deliverable.isLocked && 
                         !(['delivered', 'approved', 'revision_requested'].includes(deliverable.status)) && (
                          <div className="w-full text-center py-2 text-gray-400 italic text-sm">
                            No disponible
                          </div>
                        )}
                      </div>
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
        previousDelivery={selectedDeliverable?.previousDelivery}
        isResubmission={selectedDeliverable?.status === 'revision_requested'}
        onSuccess={handleDeliverySuccess}
      />

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
        />
      )}
    </>
  );
}
