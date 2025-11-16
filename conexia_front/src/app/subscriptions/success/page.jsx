'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiStar, FiArrowRight, FiCheck } from 'react-icons/fi';
import useSessionTimeout from '@/hooks/useSessionTimeout';
import { useAuth } from '@/context/AuthContext';
import { getPlanById } from '@/service/plans/plansService';
import { confirmSubscription as confirmSubscriptionService } from '@/service/memberships/membershipService';
import { isBenefitActive } from '@/utils/planFormatters';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState('pending'); // 'pending' | 'success' | 'error'
  const [confirmationError, setConfirmationError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Capturar parámetros de MercadoPago
        const preapprovalId = searchParams.get('preapproval_id');
        const subscriptionId = searchParams.get('external_reference');
        const status = searchParams.get('status');
        const paymentId = searchParams.get('payment_id');

        console.log('📋 Parámetros de retorno de MercadoPago:', {
          preapprovalId,
          subscriptionId,
          status,
          paymentId,
        });

        // 2️⃣ Confirmar suscripción con preapproval_id
        // MercadoPago solo envía preapproval_id en la URL de retorno para suscripciones
        if (preapprovalId) {
          console.log('✅ preapproval_id detectado, confirmando suscripción...');
          
          // Usar subscriptionId de la URL si está, sino del localStorage
          let subId = subscriptionId;
          if (!subId) {
            const stored = localStorage.getItem('pendingSubscription');
            if (stored) {
              const data = JSON.parse(stored);
              subId = data.subscriptionId;
              console.log('📦 subscriptionId obtenido de localStorage:', subId);
            }
          }
          
          if (subId) {
            await confirmSubscription(subId, preapprovalId);
          } else {
            console.error('❌ No se pudo obtener subscriptionId');
            setConfirmationStatus('error');
            setConfirmationError('No se pudo identificar la suscripción. Por favor contacta a soporte.');
          }
        } else if (status === 'rejected' || status === 'cancelled') {
          console.warn('⚠️ Pago rechazado o cancelado, status:', status);
          setConfirmationStatus('error');
          setConfirmationError('El pago fue rechazado o cancelado');
        } else {
          console.warn('⚠️ No se recibió preapproval_id en la URL');
          setConfirmationStatus('error');
          setConfirmationError('No se recibieron los datos necesarios de MercadoPago');
        }

        // 3️⃣ Obtener datos de la suscripción desde localStorage
        const stored = localStorage.getItem('pendingSubscription');
        if (stored) {
          const data = JSON.parse(stored);
          setSubscriptionData(data);
          
          // Obtener detalles del plan desde el backend
          if (data.planId) {
            const plan = await getPlanById(data.planId);
            setPlanDetails(plan);
          }
          
          // Actualizar status a completado
          const updated = { ...data, status: 'completed' };
          localStorage.setItem('pendingSubscription', JSON.stringify(updated));
        }
      } catch (err) {
        console.error('❌ Error al cargar datos de suscripción:', err);
        setConfirmationStatus('error');
        setConfirmationError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Confetti animation (opcional - se puede agregar una librería)
    // import confetti from 'canvas-confetti';
    // confetti({ particleCount: 100, spread: 70 });
  }, [searchParams]);

  /**
   * Confirma la suscripción en el backend
   */
  const confirmSubscription = async (subscriptionId, preapprovalId) => {
    try {
      console.log(`🔄 Confirmando suscripción ${subscriptionId} con preapproval ${preapprovalId}`);

      const result = await confirmSubscriptionService(subscriptionId, preapprovalId);

      console.log('✅ Suscripción activada correctamente:', result);
      setConfirmationStatus('success');
      
      // Opcionalmente puedes actualizar el estado con más información
      if (result.data) {
        setSubscriptionData(prev => ({
          ...prev,
          ...result.data,
          status: 'active'
        }));
      }
    } catch (error) {
      console.error('❌ Error al confirmar suscripción:', error);
      setConfirmationStatus('error');
      setConfirmationError(error.message || 'Error al activar la suscripción');
      
      // Si el error es por token expirado, el fetchWithRefresh lo manejará automáticamente
    }
  };

  const handleGoToProfile = () => {
    if (user?.id) {
      router.push(`/profile/userProfile/${user.id}`);
    } else {
      router.push('/profile');
    }
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
            {/* Estado de confirmación */}
            {confirmationStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                  <p className="text-sm text-yellow-800">
                    <strong>Activando tu suscripción...</strong> Por favor espera un momento.
                  </p>
                </div>
              </div>
            )}

            {confirmationStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 rounded-full p-1 mt-0.5">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                      Error al activar la suscripción
                    </p>
                    <p className="text-sm text-red-700">
                      {confirmationError || 'No se pudo activar la suscripción automáticamente.'}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      No te preocupes, tu pago fue procesado correctamente. Nuestro sistema intentará activar tu suscripción automáticamente en los próximos minutos. Si el problema persiste, contacta a soporte.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <FiStar className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Bienvenido a tu nuevo plan!
                </h2>
                <FiStar className="w-6 h-6 text-yellow-500" />
              </div>
              <p className="text-gray-600 max-w-md mx-auto">
                {confirmationStatus === 'success' 
                  ? 'Tu suscripción ha sido activada correctamente. Ahora tienes acceso a todas las funcionalidades premium de Conexia.'
                  : 'Tu pago fue procesado exitosamente. Comienza a disfrutar de tus nuevos beneficios.'}
              </p>
              
              {/* Información de cobros automáticos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>💳 Cobros automáticos activados:</strong> Tu tarjeta será cargada automáticamente 
                  en cada renovación. Puedes cancelar la suscripción en cualquier momento desde tu panel de usuario.
                </p>
              </div>
            </div>

            {/* Benefits Highlight - Mostrar beneficios del plan adquirido */}
            <div className="bg-gradient-to-br from-conexia-soft to-white border border-conexia-green/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {planDetails ? `Beneficios del plan` : '¿Qué puedes hacer ahora?'}
              </h3>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
                </div>
              ) : planDetails?.benefits && planDetails.benefits.length > 0 ? (
                <div className="space-y-3">
                  {planDetails.benefits
                    .filter(benefit => isBenefitActive(benefit.value))
                    .map((benefit, index) => {
                      const isNumeric = typeof benefit.value === 'number';
                      const isUnlimited = benefit.value === 'UNLIMITED' || benefit.value === -1;
                      
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className="bg-conexia-green/10 rounded-full p-1.5 mt-0.5 flex-shrink-0">
                            <FiCheck className="w-4 h-4 text-conexia-green" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {benefit.name || benefit.key}
                              {isUnlimited && (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                  ILIMITADO
                                </span>
                              )}
                              {isNumeric && benefit.value > 0 && !isUnlimited && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                                  {benefit.value}
                                </span>
                              )}
                            </p>
                            {benefit.description && (
                              <p className="text-sm text-gray-600 mt-0.5">{benefit.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                // Fallback a beneficios genéricos si no se pueden cargar
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-conexia-green/10 rounded-full p-1.5 mt-0.5">
                      <FiCheck className="w-4 h-4 text-conexia-green" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Acceso completo</p>
                      <p className="text-sm text-gray-600">Disfruta de todas las funcionalidades de tu plan</p>
                    </div>
                  </div>
                </div>
              )}
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
