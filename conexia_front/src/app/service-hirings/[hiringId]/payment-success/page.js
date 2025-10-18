'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Package } from 'lucide-react';
import Navbar from '@/components/navbar/Navbar';
import Button from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hiringId = params.hiringId;
  
  const [countdown, setCountdown] = useState(5);
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    // Countdown para redirección automática
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(`/service-delivery/${hiringId}`);
    }
  }, [countdown, hiringId, router]);

  const handleGoToDelivery = () => {
    router.push(`/service-delivery/${hiringId}`);
  };

  const handleGoToMyServices = () => {
    router.push('/requested-services');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Card Principal */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header con ícono de éxito */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 animate-bounce">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Pago Exitoso!
              </h1>
              <p className="text-green-100 text-sm">
                Tu pago ha sido procesado correctamente
              </p>
            </div>

            {/* Contenido */}
            <div className="px-6 py-6">
              <div className="space-y-4 mb-6">
                {/* Mensaje principal */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm leading-relaxed">
                    El servicio ha sido marcado como completado. Ya puedes acceder al contenido sin restricciones.
                  </p>
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
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {status}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={handleGoToDelivery}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Package size={18} className="mr-2" />
                  Ver Entrega
                  <ArrowRight size={16} className="ml-2" />
                </Button>

                <button
                  onClick={handleGoToMyServices}
                  className="w-full text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
                >
                  Ir a Mis Servicios Solicitados
                </button>
              </div>

              {/* Contador de redirección */}
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  Redirigiendo automáticamente en {countdown} segundos...
                </p>
              </div>
            </div>
          </div>

          {/* Info adicional */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Recibirás un comprobante de pago en tu correo electrónico
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
