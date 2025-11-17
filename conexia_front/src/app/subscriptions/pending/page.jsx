'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiClock, FiAlertCircle, FiRefreshCw, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';

function PendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    // Actualizar estado de la suscripción en localStorage
    const stored = localStorage.getItem('pendingSubscription');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const updated = { ...data, status: 'pending' };
        localStorage.setItem('pendingSubscription', JSON.stringify(updated));
      } catch (err) {
        console.error('Error al parsear datos de suscripción:', err);
      }
    }

    // Timer para mostrar tiempo transcurrido
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoToMyPlan = () => {
    router.push('/settings/my-plan');
  };

  const handleRefreshStatus = async () => {
    const subscriptionId = searchParams.get('external_reference');
    const preapprovalId = searchParams.get('preapproval_id');
    
    if (subscriptionId && preapprovalId) {
      // Si tenemos los parámetros, intentar confirmar
      try {
        const { confirmSubscription } = await import('@/service/memberships/membershipService');
        await confirmSubscription(subscriptionId, preapprovalId);
        router.push(`/subscriptions/success?preapproval_id=${preapprovalId}&external_reference=${subscriptionId}&status=approved`);
      } catch (error) {
        console.error('Error al verificar estado:', error);
        alert('No se pudo verificar el estado. Por favor, intenta más tarde.');
      }
    } else {
      // Simplemente recargar la página
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Pending Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg relative">
                <FiClock className="w-16 h-16 text-yellow-500" />
                {/* Animated pulse */}
                <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Pago pendiente
            </h1>
            <p className="text-yellow-50 text-lg">
              Estamos procesando tu suscripción
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Qué significa esto?
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Tu pago está siendo procesado. Dependiendo del método de pago elegido, 
                esto puede tomar algunos minutos o hasta 2 días hábiles.
              </p>
            </div>

            {/* Timer */}
            <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-xl p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Tiempo transcurrido</p>
              <p className="text-4xl font-bold text-yellow-600 font-mono">
                {formatTime(timeElapsed)}
              </p>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <FiAlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Tiempos de procesamiento
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Tarjeta de crédito/débito:</strong> 5-15 minutos</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Transferencia bancaria:</strong> 1-2 días hábiles</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>Efectivo (Rapipago/Pago Fácil):</strong> Hasta 24 horas</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                  <span><strong>MercadoPago:</strong> Instantáneo o hasta 48 horas</span>
                </li>
              </ul>
            </div>

            {/* Payment Info */}
            {searchParams.get('payment_id') && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Detalles del pago</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de pago:</span>
                    <span className="font-mono text-gray-900">{searchParams.get('payment_id')}</span>
                  </div>
                  {searchParams.get('external_reference') && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referencia:</span>
                      <span className="font-mono text-gray-900">{searchParams.get('external_reference')}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-semibold text-yellow-600">Pendiente</span>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            <div className="bg-gradient-to-br from-conexia-soft to-white border border-conexia-green/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                ¿Qué sucede después?
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-conexia-green">1.</span>
                  <span>Recibirás un email cuando se confirme el pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-conexia-green">2.</span>
                  <span>Tu plan se activará automáticamente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-conexia-green">3.</span>
                  <span>Podrás acceder a todos los beneficios de inmediato</span>
                </li>
              </ol>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleRefreshStatus}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors font-medium shadow-lg shadow-conexia-green/20"
              >
                <FiRefreshCw className="w-5 h-5" />
                Verificar estado del pago
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGoToMyPlan}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Explorar planes
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Ir al inicio
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-gray-500 pt-4">
              Si tienes dudas o el pago no se confirma en el tiempo estimado, 
              contacta a nuestro soporte con el ID de pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionPendingPage() {
  useSessionTimeout();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}
