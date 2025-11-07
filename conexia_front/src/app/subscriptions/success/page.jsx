'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiStar, FiArrowRight } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState(null);

  useEffect(() => {
    // Obtener datos de la suscripción desde localStorage
    const stored = localStorage.getItem('pendingSubscription');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setSubscriptionData(data);
        // Actualizar status a completado
        const updated = { ...data, status: 'completed' };
        localStorage.setItem('pendingSubscription', JSON.stringify(updated));
      } catch (err) {
        console.error('Error al parsear datos de suscripción:', err);
      }
    }

    // Confetti animation (opcional - se puede agregar una librería)
    // import confetti from 'canvas-confetti';
    // confetti({ particleCount: 100, spread: 70 });
  }, []);

  const handleGoToProfile = () => {
    router.push('/profile');
  };

  const handleGoToMyPlan = () => {
    router.push('/settings/my-plan');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-conexia-soft flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-conexia-green to-green-600 px-8 py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <FiCheckCircle className="w-16 h-16 text-conexia-green" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              ¡Pago exitoso!
            </h1>
            <p className="text-green-50 text-lg">
              Tu plan ha sido activado correctamente
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <FiStar className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Bienvenido a tu nuevo plan!
                </h2>
                <FiStar className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 max-w-md mx-auto">
                Ahora tienes acceso a todas las funcionalidades premium de Conexia. 
                Comienza a disfrutar de tus nuevos beneficios.
              </p>
              
              {/* Información de cobros automáticos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>💳 Cobros automáticos activados:</strong> Tu tarjeta será cargada automáticamente 
                  en cada renovación. Puedes cancelar la suscripción en cualquier momento desde tu panel de usuario.
                </p>
              </div>
            </div>

            {/* Benefits Highlight */}
            <div className="bg-gradient-to-br from-conexia-soft to-white border border-conexia-green/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Qué puedes hacer ahora?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-conexia-green/10 rounded-full p-1.5 mt-0.5">
                    <FiCheckCircle className="w-4 h-4 text-conexia-green" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Publicaciones ilimitadas</p>
                    <p className="text-sm text-gray-600">Crea todos los proyectos y servicios que necesites</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-conexia-green/10 rounded-full p-1.5 mt-0.5">
                    <FiCheckCircle className="w-4 h-4 text-conexia-green" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Conexiones prioritarias</p>
                    <p className="text-sm text-gray-600">Destaca tu perfil y obtén más visibilidad</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-conexia-green/10 rounded-full p-1.5 mt-0.5">
                    <FiCheckCircle className="w-4 h-4 text-conexia-green" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Soporte prioritario</p>
                    <p className="text-sm text-gray-600">Atención preferencial en todos tus consultas</p>
                  </div>
                </div>
              </div>
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
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleGoToProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-conexia-green text-white rounded-lg hover:bg-conexia-green/90 transition-colors font-medium shadow-lg shadow-conexia-green/20"
              >
                Ver mi perfil
                <FiArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={handleGoToMyPlan}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Ver mi plan
                </button>
                <button
                  onClick={handleGoHome}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Ir al inicio
                </button>
              </div>
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-gray-500 pt-4">
              Recibirás un email de confirmación con todos los detalles de tu suscripción
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  useSessionTimeout();

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-conexia-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
