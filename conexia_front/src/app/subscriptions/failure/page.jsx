'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiXCircle, FiAlertCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';

export default function SubscriptionFailurePage() {
  useSessionTimeout();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Actualizar estado de la suscripción en localStorage
    const stored = localStorage.getItem('pendingSubscription');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const updated = { ...data, status: 'failed' };
        localStorage.setItem('pendingSubscription', JSON.stringify(updated));
      } catch (err) {
        console.error('Error al parsear datos de suscripción:', err);
      }
    }
  }, []);

  const handleRetry = () => {
    router.push('/settings/my-plan');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleContactSupport = () => {
    // TODO: Implementar enlace a soporte o chat
    alert('Próximamente: Chat de soporte');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Failure Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <FiXCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Pago no procesado
            </h1>
            <p className="text-red-50 text-lg">
              No pudimos completar tu suscripción
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">
                ¿Qué sucedió?
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                El pago no pudo ser procesado. Esto puede deberse a varios motivos, 
                pero no te preocupes, puedes intentarlo nuevamente.
              </p>
            </div>

            {/* Possible Reasons */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <FiAlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Posibles causas
                  </h3>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Fondos insuficientes en tu cuenta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Datos de la tarjeta incorrectos o expirada</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>El banco rechazó la transacción</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Se canceló el pago durante el proceso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Límite de operaciones excedido</span>
                </li>
              </ul>
            </div>

            {/* Payment Info */}
            {searchParams.get('payment_id') && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Detalles del intento</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de pago:</span>
                    <span className="font-mono text-gray-900">{searchParams.get('payment_id')}</span>
                  </div>
                  {searchParams.get('status') && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-mono text-red-600">{searchParams.get('status')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors font-medium shadow-lg shadow-conexia-green/20"
              >
                <FiRefreshCw className="w-5 h-5" />
                Intentar nuevamente
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleContactSupport}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Contactar soporte
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Verifica los datos de tu tarjeta y asegúrate de tener fondos suficientes. 
                Si el problema persiste, contacta a tu banco o prueba con otro medio de pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
