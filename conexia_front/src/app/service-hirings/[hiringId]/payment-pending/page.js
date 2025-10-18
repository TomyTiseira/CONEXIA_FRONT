'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Button from '@/components/ui/Button';

export default function PaymentPendingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hiringId = params.hiringId;
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const handleCheckStatus = () => {
    // Recargar para ver si el estado cambió
    router.refresh();
  };

  const handleGoToDelivery = () => {
    router.push(`/service-delivery/${hiringId}`);
  };

  const handleGoToMyServices = () => {
    router.push('/requested-services');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con ícono de pendiente */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <Clock size={48} className="text-yellow-500 animate-pulse" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Pago Pendiente
              </h1>
              <p className="text-yellow-100 text-sm">
                Tu pago está siendo procesado
              </p>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6">
              <div className="space-y-4 mb-6">
                {/* Mensaje principal */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-900 text-sm font-medium mb-2">
                        ¿Qué significa esto?
                      </p>
                      <p className="text-yellow-800 text-sm leading-relaxed mb-2">
                        Tu pago está en proceso de verificación. Esto puede tomar algunos minutos u horas dependiendo del método de pago utilizado.
                      </p>
                      <ul className="text-yellow-700 text-xs space-y-1 ml-4 list-disc">
                        <li>Pagos con efectivo: hasta 48 horas</li>
                        <li>Transferencias bancarias: 1-3 días hábiles</li>
                        <li>Tarjetas: usualmente instantáneo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Información del pago */}
                {paymentId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">ID de Pago:</span>
                      <span className="font-mono text-gray-900">{paymentId}</span>
                    </div>
                    {status && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Estado:</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          {status}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900 text-sm font-medium mb-1">
                    ¿Qué hacer mientras tanto?
                  </p>
                  <p className="text-blue-800 text-xs">
                    Te notificaremos por correo cuando tu pago sea confirmado. La entrega estará disponible sin restricciones una vez aprobado el pago.
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleCheckStatus}
                  className="w-full"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Verificar Estado
                </Button>

                <button
                  onClick={handleGoToDelivery}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Volver a la Entrega
                </button>

                <button
                  onClick={handleGoToMyServices}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
                >
                  Ir a Mis Servicios Solicitados
                </button>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Recibirás una notificación cuando el pago sea confirmado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
