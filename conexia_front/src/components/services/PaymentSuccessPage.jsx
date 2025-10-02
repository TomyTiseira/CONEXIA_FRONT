'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';

export default function PaymentSuccessPage() {
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
  
  const [countdown, setCountdown] = useState(5);
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Procesar información del pago cuando lleguen los parámetros
    if (paymentId && status) {
      updatePaymentStatus();
    } else {
      console.warn('⚠️  [PAYMENT SUCCESS] Faltan parámetros de pago:', {
        hasPaymentId: !!paymentId,
        hasStatus: !!status
      });
    }
  }, [paymentId, status, hiringId]);

  useEffect(() => {
    // Countdown para redirección automática solo después de procesar
    if (!loading) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/services/my-hirings');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, router]);

  const updatePaymentStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const requestBody = {
        payment_id: paymentId,
        status,
        external_reference: externalReference,
        merchant_order_id: merchantOrderId,
        preference_id: preferenceId
      };
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/service-hirings/${hiringId}/payment-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      const result = await response.json();
      
      setPaymentInfo(result);
      
    } catch (error) {
      console.error('❌ [PAYMENT SUCCESS] Error updating payment status:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          {/* Icono de éxito */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle size={64} className="text-green-600" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Pago Exitoso!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago se ha procesado correctamente. El servicio ha sido contratado 
            y el proveedor será notificado para comenzar el trabajo.
          </p>

          {/* Información del pago */}
          {paymentId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Información del pago:</strong>
                <br />
                • ID de pago: {paymentId}
                <br />
                • Estado: {status}
                {externalReference && (
                  <>
                    <br />
                    • Referencia: {externalReference}
                  </>
                )}
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>¿Qué sigue?</strong>
              <br />
              • El proveedor iniciará el trabajo según lo acordado
              <br />
              • Recibirás actualizaciones del progreso
              <br />
              • Podrás comunicarte a través del sistema de mensajería
            </p>
          </div>

          {/* Mostrar loading o countdown */}
          {loading ? (
            <p className="text-sm text-gray-500 mb-6">
              Procesando información del pago...
            </p>
          ) : (
            <p className="text-sm text-gray-500 mb-6">
              Serás redirigido automáticamente en {countdown} segundos...
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="informative"
              onClick={() => router.push('/services/my-hirings')}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              Ver Mis Solicitudes
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
        </div>
      </div>
    </>
  );
}