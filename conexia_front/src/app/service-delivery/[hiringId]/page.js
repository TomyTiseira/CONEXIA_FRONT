'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHiringWithDeliveries, useDeliveries } from '@/hooks/deliveries';
import { ArrowLeft, Package, DollarSign, User, Calendar, FileText } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import DeliveryReview from '@/components/deliveries/DeliveryReview';
import StatusBadge from '@/components/common/StatusBadge';
import { getUserDisplayName } from '@/utils/formatUserName';
import { getUnitLabelPlural } from '@/utils/timeUnit';

export default function ServiceDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const hiringId = parseInt(params.hiringId);
  const { user } = useAuth();

  const { hiring, loading: hiringLoading, loadHiring } = useHiringWithDeliveries(hiringId);
  const { deliveries, loading: deliveriesLoading, loadDeliveries } = useDeliveries(hiringId);

  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0);

  useEffect(() => {
    if (hiringId) {
      loadHiring();
      loadDeliveries();
    }
  }, [hiringId, loadHiring, loadDeliveries]);

  const handleReviewSuccess = () => {
    // Recargar datos después de revisar
    loadHiring();
    loadDeliveries();
  };

  const isByDeliverables = hiring?.paymentModality?.code === 'by_deliverables';
  const deliverables = hiring?.deliverables || [];
  
  // Verificar si el usuario actual es el cliente (quien solicitó el servicio)
  const isClient = user?.id === hiring?.userId;

  // Debug: Ver qué datos llegan
  useEffect(() => {
    if (hiring) {
      console.log('========== DEBUG HIRING DATA ==========');
      console.log('Full hiring object:', hiring);
      console.log('Service:', hiring.service);
      console.log('Service owner:', hiring.service?.owner);
      console.log('=====================================');
    }
  }, [hiring]);

  // Agrupar deliveries por deliverable
  const getDeliveriesByDeliverable = (deliverableId) => {
    return deliveries.filter(d => d.deliverableId === deliverableId);
  };

  // Obtener deliveries para entrega total
  const getFullDeliveries = () => {
    return deliveries.filter(d => !d.deliverableId);
  };

  const loading = hiringLoading || deliveriesLoading;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando entregas...</p>
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
              <Package size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Servicio no encontrado
              </h3>
              <button
                onClick={() => router.push('/requested-services')}
                className="text-conexia-green hover:underline"
              >
                Volver a Mis Servicios Solicitados
              </button>
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
                const serviceId = hiring?.service?.id;
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
              Revisar Entregas
            </h1>
          </div>

          {/* Info del servicio */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
                  <p className="text-sm text-gray-500">Precio Total</p>
                  <p className="text-2xl font-bold text-gray-900 flex items-center">
                    <DollarSign size={20} />
                    {hiring.quotedPrice?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Modalidad de pago:</span>
                <span className="font-semibold text-gray-900">
                  {hiring.paymentModality?.name || 'No especificada'}
                </span>
              </div>
            </div>
          </div>

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
                      {deliverables
                        .sort((a, b) => a.orderIndex - b.orderIndex)
                        .map((deliverable, index) => {
                          const deliverableDeliveries = getDeliveriesByDeliverable(deliverable.id);
                          const latestDelivery = deliverableDeliveries[0];

                          return (
                            <button
                              key={deliverable.id}
                              onClick={() => setSelectedDeliveryIndex(index)}
                              className={`flex-1 min-w-[200px] px-4 py-4 text-left border-b-2 transition-colors ${
                                selectedDeliveryIndex === index
                                  ? 'border-conexia-green bg-conexia-green/5 text-conexia-green'
                                  : 'border-transparent hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold">
                                  Entregable {deliverable.orderIndex}
                                </span>
                                {/* Mostrar estado de la delivery si existe, sino el estado del deliverable */}
                                {latestDelivery ? (
                                  <StatusBadge 
                                    status={latestDelivery.status} 
                                    type="delivery" 
                                    className="text-xs"
                                  />
                                ) : (
                                  <StatusBadge 
                                    status={deliverable.status} 
                                    type="deliverable" 
                                    className="text-xs"
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
                    {deliverables[selectedDeliveryIndex] && (
                      <>
                        <div className="mb-6 pb-6 border-b">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {deliverables[selectedDeliveryIndex].title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {deliverables[selectedDeliveryIndex].description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              Precio: ${deliverables[selectedDeliveryIndex].price?.toLocaleString()}
                            </span>
                            <span>
                              Fecha estimada: {new Date(deliverables[selectedDeliveryIndex].estimatedDeliveryDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {(() => {
                          const deliverableDeliveries = getDeliveriesByDeliverable(
                            deliverables[selectedDeliveryIndex].id
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
                                />
                              ))}
                            </div>
                          );
                        })()}
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
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
