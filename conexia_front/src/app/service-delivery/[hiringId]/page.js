'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHiringWithDeliveries, useDeliveries } from '@/hooks/deliveries';
import { fetchDeliverablesWithValidation } from '@/service/deliveries';
import { useClaims } from '@/hooks/claims';
import { Package, DollarSign, User, Calendar, FileText, Lock } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import DeliveryReview from '@/components/deliveries/DeliveryReview';
import LockedDeliverableCard from '@/components/deliveries/LockedDeliverableCard';
import StatusBadge from '@/components/common/StatusBadge';
import { ClaimAlert, ClaimModal } from '@/components/claims';
import { NotFound, LoadingSpinner, Toast } from '@/components/ui';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabelPlural } from '@/utils/timeUnit';

export default function ServiceDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const hiringId = parseInt(params.hiringId);
  const { user, token, isLoading: authLoading } = useAuth();

  const { hiring, loading: hiringLoading, error: hiringError, loadHiring } = useHiringWithDeliveries(hiringId);
  const { deliveries, loading: deliveriesLoading, error: deliveriesError, loadDeliveries } = useDeliveries(hiringId);
  const { activeClaim, hasActiveClaim, refetch: refetchClaims } = useClaims(hiringId, token);

  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [deliverables, setDeliverables] = useState([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [toast, setToast] = useState(null);
  // null = chequeando, true/false = resuelto
  const [accessDenied, setAccessDenied] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message, isVisible: true });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!hiringId) return;

      // Esperar a que el usuario esté cargado para evitar denegar por falso negativo
      if (authLoading || !user?.id) return;

      setAccessDenied(null);

      const hiringData = await loadHiring().catch(() => null);
      if (cancelled) return;
      if (!hiringData) return;

      const isClientLocal = user.id === hiringData.userId;
      const providerId =
        hiringData?.service?.userId ??
        hiringData?.service?.owner?.id ??
        hiringData?.service?.owner?.userId ??
        hiringData?.service?.ownerId ??
        hiringData?.owner?.id ??
        hiringData?.ownerId ??
        null;
      const isProviderLocal = !!providerId && user.id === providerId;

      if (!isClientLocal && !isProviderLocal) {
        setAccessDenied(true);
        return;
      }

      setAccessDenied(false);
      await loadDeliveries().catch(() => null);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [hiringId, loadHiring, loadDeliveries, user, authLoading]);

  // Cargar entregables con validaciones si es modalidad por entregables
  useEffect(() => {
    const loadDeliverablesWithValidation = async () => {
      if (!hiringId || !hiring) return;

      // Página solo para cliente
      if (accessDenied) return;
      
      const isByDeliverables = hiring?.paymentModality?.code === 'by_deliverables';
      if (!isByDeliverables) return;

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
  }, [hiringId, hiring, accessDenied]);

  const handleReviewSuccess = () => {
    // Recargar datos después de revisar
    loadHiring();
    loadDeliveries();
  };

  const handleClaimSuccess = () => {
    // Recargar datos después de crear reclamo
    loadHiring();
    loadDeliveries();
    refetchClaims();
  };

  const isByDeliverables = hiring?.paymentModality?.code === 'by_deliverables';
  
  // Verificar si el usuario actual es el cliente (quien solicitó el servicio)
  const isClient = user?.id === hiring?.userId;
  const isProvider = !isClient;

  // Agrupar deliveries por deliverable
  const getDeliveriesByDeliverable = (deliverableId) => {
    return deliveries.filter(d => d.deliverableId === deliverableId);
  };

  // Obtener deliveries para entrega total
  const getFullDeliveries = () => {
    return deliveries.filter(d => !d.deliverableId);
  };

  const loading = hiringLoading || deliveriesLoading || deliverablesLoading;

  // TODOS ven TODOS los entregables
  // La diferencia está en cómo se muestran (bloqueados vs desbloqueados)
  const visibleDeliverables = deliverables;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando entregas...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Ya tengo respuesta del hiring o del auth, pero todavía no resolví permisos
  if ((hiring || authLoading) && accessDenied === null) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Cargando..." fullScreen={true} />
      </>
    );
  }

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

  // Primer render: todavía no terminó de cargar y no hay error
  if (!hiring && !hiringError && !deliveriesError) {
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Cargando entregas..." fullScreen={true} />
      </>
    );
  }

  if (hiringError || deliveriesError) {
    const err = hiringError || deliveriesError;
    const statusCode = err?.statusCode || err?.status;
    const title = statusCode === 403
      ? 'Página no encontrada'
      : statusCode === 404
        ? 'Servicio no encontrado'
        : 'No se pudo cargar la página';
    const message = statusCode === 403
      ? 'La página que buscas no existe o no tienes permisos para acceder a ella.'
      : (err?.message || 'Ocurrió un error al cargar la página.');

    return (
      <NotFound
        title={title}
        message={message}
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
                  // Si es cliente, redirigir a "Mis Solicitudes"
                  if (isClient) {
                    router.push('/services/my-hirings');
                  } else {
                    // Si es prestador, redirigir a solicitudes del servicio o historial
                    const serviceId = hiring?.service?.id;
                    if (serviceId) {
                      router.push(`/services/my-services/${serviceId}/requests`);
                    } else {
                      router.back();
                    }
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
                  {isClient ? 'Revisar entregas' : 'Entregas del servicio'}
                </h1>
              </div>

              <div className="w-10" />
            </div>
          </div>

          {/* Info del servicio */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 break-words">
                  {hiring.service?.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    Prestador: {getUserDisplayName(hiring.service?.owner)}
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2" />
                    {new Date(hiring.createdAt).toLocaleDateString()}
                  </div>
                  {hiring.estimatedHours && hiring.estimatedTimeUnit && (
                    <div className="flex items-center">
                      <FileText size={16} className="mr-2" />
                      {hiring.estimatedHours} {getUnitLabelPlural(hiring.estimatedTimeUnit)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={hiring.status?.code} type="hiring" />
                <div className="text-right">
                  <p className="text-sm text-gray-500">Precio total</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center">
                    <DollarSign size={20} />
                    {hiring.quotedPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Modalidad de pago:</span>
                <span className="font-semibold text-gray-900">
                  {hiring.paymentModality?.name || 'No especificada'}
                </span>
              </div>
              
              {/* Información de pago para clientes con pago total */}
              {isClient && hiring.paymentModality?.code === 'full_payment' && hiring.status?.code === 'delivered' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <DollarSign size={18} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-1">
                        Pago pendiente
                      </p>
                      <p className="text-xs text-blue-800">
                        Al aprobar esta entrega, deberás pagar el 75% restante (${(hiring.quotedPrice * 0.75).toLocaleString()}) 
                        del total del servicio. Ya pagaste el 25% inicial (${(hiring.quotedPrice * 0.25).toLocaleString()}).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alerta de Reclamo Activo */}
          {hasActiveClaim && <ClaimAlert claim={activeClaim} />}

          {/* Contenido principal */}
          {deliveries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aún no hay entregas
              </h3>
              <p className="text-gray-600">
                El prestador aún no ha realizado ninguna entrega para este servicio.
              </p>
            </div>
          ) : (
            <>
              {isByDeliverables ? (
                /* Vista con Tabs para entregables */
                <div>
                  {/* Tabs */}
                  <div className="bg-white rounded-t-lg shadow-sm border-b overflow-x-auto">
                    <div className="flex min-w-full">
                      {visibleDeliverables
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((deliverable, index) => {
                          const deliverableDeliveries = getDeliveriesByDeliverable(deliverable.id);
                          const latestDelivery = deliverableDeliveries[0];
                          // Solo el cliente ve entregables bloqueados
                          const isLocked = isClient && deliverable.isLocked === true;

                          return (
                            <button
                              key={deliverable.id}
                              onClick={() => setSelectedDeliveryIndex(index)}
                              className={`flex-1 min-w-[200px] px-4 py-4 text-left border-b-2 transition-colors ${
                                selectedDeliveryIndex === index
                                  ? 'border-conexia-green bg-conexia-green/5 text-conexia-green'
                                  : 'border-transparent hover:bg-gray-50 text-gray-600'
                              } ${isLocked ? 'opacity-75' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {/* Solo mostrar candado para cliente bloqueado */}
                                  {isLocked && <Lock size={16} className="text-red-500 flex-shrink-0" />}
                                  <span className="font-semibold truncate">
                                    Entregable {deliverable.orderIndex}
                                  </span>
                                </div>
                                {/* Mostrar estado de la delivery si existe, sino el estado del deliverable */}
                                {latestDelivery ? (
                                  <StatusBadge 
                                    status={latestDelivery.status} 
                                    type="delivery" 
                                    className="text-xs flex-shrink-0"
                                  />
                                ) : isLocked ? (
                                  /* Solo cliente ve badge de bloqueado */
                                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                                    Bloqueado
                                  </span>
                                ) : (
                                  <StatusBadge 
                                    status={deliverable.status} 
                                    type="deliverable" 
                                    className="text-xs flex-shrink-0"
                                  />
                                )}
                              </div>
                              <p className="text-sm truncate">{deliverable.title}</p>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Contenido del Tab */}
                  <div className="bg-white rounded-b-lg shadow-sm p-6">
                    {visibleDeliverables[selectedDeliveryIndex] && (
                      <>
                        {/* Solo el CLIENTE ve el LockedDeliverableCard cuando está bloqueado */}
                        {/* El PROVEEDOR siempre ve el contenido normal (puede ver todas sus entregas) */}
                        {visibleDeliverables[selectedDeliveryIndex].isLocked && isClient ? (
                          <LockedDeliverableCard 
                            deliverable={visibleDeliverables[selectedDeliveryIndex]}
                            userRole="CLIENT"
                          />
                        ) : (
                          <>
                            <div className="mb-6 pb-6 border-b">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {visibleDeliverables[selectedDeliveryIndex].title}
                              </h3>
                              <p className="text-gray-600 mb-3">
                                {visibleDeliverables[selectedDeliveryIndex].description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>
                                  Precio: ${visibleDeliverables[selectedDeliveryIndex].price?.toLocaleString()}
                                </span>
                                <span>
                                  Fecha estimada: {new Date(visibleDeliverables[selectedDeliveryIndex].estimatedDeliveryDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {(() => {
                              const deliverableDeliveries = getDeliveriesByDeliverable(
                                visibleDeliverables[selectedDeliveryIndex].id
                              );

                              if (deliverableDeliveries.length === 0) {
                                return (
                                  <div className="text-center py-8">
                                    <Package size={48} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600">
                                      Este entregable aún no ha sido entregado
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div className="space-y-6">
                                  {deliverableDeliveries.map((delivery) => (
                                    <DeliveryReview
                                      key={delivery.id}
                                      delivery={delivery}
                                      isClient={isClient}
                                      onReviewSuccess={handleReviewSuccess}
                                      hasActiveClaim={hasActiveClaim}
                                      showToast={showToast}
                                    />
                                  ))}
                                </div>
                              );
                            })()}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                /* Vista simple para entrega total */
                <div className="space-y-6">
                  {getFullDeliveries().length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                      <Package size={64} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Aún no hay entregas
                      </h3>
                      <p className="text-gray-600">
                        El prestador aún no ha realizado la entrega de este servicio.
                      </p>
                    </div>
                  ) : (
                    getFullDeliveries().map((delivery) => (
                      <DeliveryReview
                        key={delivery.id}
                        delivery={delivery}
                        isClient={isClient}
                        onReviewSuccess={handleReviewSuccess}
                        hasActiveClaim={hasActiveClaim}
                        showToast={showToast}
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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

      {/* Modal de Crear Reclamo */}
      {hiring && isClient && (
        <ClaimModal
          isOpen={isClaimModalOpen}
          onClose={() => setIsClaimModalOpen(false)}
          hiringId={hiringId}
          isClient={isClient}
          token={token}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}
