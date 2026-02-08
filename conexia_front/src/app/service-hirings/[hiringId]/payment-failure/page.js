'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Button from '@/components/ui/Button';

export default function PaymentFailurePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hiringId = params.hiringId;
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const handleRetry = () => {
    // Volver a la página de entrega para intentar el pago nuevamente
    router.push(`/service-delivery/${hiringId}`);
  };

  const handleGoBack = () => {
    router.push(`/service-delivery/${hiringId}`);
  };

  const handleGoToMyServices = () => {
    router.push('/requested-services');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con ícono de error */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                <XCircle size={48} className="text-red-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Pago no procesado
              </h1>
              <p className="text-red-100 text-sm">
                No se pudo completar tu pago
              </p>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6">
              <div className="space-y-4 mb-6">
                {/* Mensaje principal */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm leading-relaxed mb-2">
                    Tu pago no pudo ser procesado. Esto puede deberse a:
                  </p>
                  <ul className="text-red-700 text-xs space-y-1 ml-4 list-disc">
                    <li>Fondos insuficientes en tu cuenta</li>
                    <li>Datos de la tarjeta incorrectos</li>
                    <li>Cancelación del pago</li>
                    <li>Problemas temporales con el procesador de pagos</li>
                  </ul>
                </div>

                {/* Información del intento de pago */}
                {paymentId && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-600">ID de Referencia:</span>
                      <span className="font-mono text-gray-900">{paymentId}</span>
                    </div>
                    {status && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Estado:</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {status}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Ayuda */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <HelpCircle size={20} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-900 text-sm font-medium mb-1">
                        ¿Necesitas ayuda?
                      </p>
                      <p className="text-blue-800 text-xs">
                        Contacta con soporte si el problema persiste
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleRetry}
                  className="w-full"
                >
                  <RefreshCw size={18} className="mr-2" />
                  Intentar nuevamente
                </Button>

                <button
                  onClick={handleGoBack}
                  className="w-full flex items-center justify-center text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Volver a la entrega
                </button>

                <button
                  onClick={handleGoToMyServices}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
                >
                  Ir a mis servicios solicitados
                </button>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              No se realizó ningún cargo a tu cuenta
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
