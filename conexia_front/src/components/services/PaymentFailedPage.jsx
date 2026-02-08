'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentFailedPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hiringId = params?.hiringId;
  
  // Parámetros de MercadoPago
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const merchantOrderId = searchParams.get('merchant_order_id');
  const preferenceId = searchParams.get('preference_id');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Notificar al backend sobre el pago fallido
    if (paymentId && status) {
      updatePaymentStatus();
    } else {
      setLoading(false);
    }
  }, [paymentId, status, hiringId]);

  const updatePaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service-hirings/${hiringId}/payment-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            payment_id: paymentId,
            status,
            external_reference: externalReference,
            merchant_order_id: merchantOrderId,
            preference_id: preferenceId
          })
        }
      );
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    router.push('/services/my-hirings');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de error */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 rounded-full p-4">
              <XCircle size={64} className="text-red-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pago No Completado
          </h1>
          
          <p className="text-gray-600 mb-6">
            No pudimos procesar tu pago en este momento. El servicio no ha sido 
            contratado y no se ha realizado ningún cargo.
          </p>

          {/* Posibles razones */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Posibles causas:</strong>
            </p>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Fondos insuficientes en la cuenta</li>
              <li>• Datos de pago incorrectos</li>
              <li>• Problemas temporales del procesador</li>
              <li>• Transacción cancelada por el usuario</li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={handleRetry}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              Intentar Nuevamente
            </Button>
            <Button
              variant="cancel"
              onClick={() => router.push('/services')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Volver a Servicios
            </Button>
          </div>

          {/* Información de contacto */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-gray-500">
              Si el problema persiste, contacta a nuestro soporte técnico
            </p>
          </div>
        </div>
      </div>
    </>
  );
}