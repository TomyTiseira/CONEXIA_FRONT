'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiCheckCircle, FiAlertCircle, FiCreditCard, FiUser, FiDollarSign } from 'react-icons/fi';
import { Zap, TrendingUp, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserPlan } from '@/hooks/memberships';
import PlanBadge from './PlanBadge';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import PaymentMethodCard from './PaymentMethodCard';
import { 
  formatMemberSince, 
  formatCurrency, 
  formatPaymentDate,
  isBenefitActive,
  formatBenefitValue
} from '@/utils/planFormatters';

/**
 * Card con información detallada del plan del usuario
 * Muestra plan actual, beneficios y estado de suscripción
 * 
 * @param {string} className - Clases CSS adicionales
 */
export default function PlanInfoCard({ className = '' }) {
  const { data, isLoading, error } = useUserPlan();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <FiAlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error al cargar plan</h3>
            <p className="text-sm text-gray-600">
              No pudimos cargar la información de tu plan
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { plan, subscription, isFreePlan, paymentInfo, memberSince } = data;
  const hasActiveSubscription = subscription && subscription.status === 'active';
  const subscriptionStatus = subscription?.status;
  const isExpired = subscriptionStatus === 'expired';
  const isPendingPayment = subscriptionStatus === 'pending_payment';
  const isPaymentFailed = subscriptionStatus === 'payment_failed';

  // Calcular días hasta renovación o vencimiento
  let daysUntilRenewal = null;
  if (hasActiveSubscription && subscription.nextPaymentDate) {
    const nextDate = new Date(subscription.nextPaymentDate);
    const today = new Date();
    daysUntilRenewal = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header con gradiente CONEXIA - igual que Explorar Planes */}
      <div className="bg-gradient-to-r from-[#48a6a7] to-[#419596] p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Mi plan</h2>
        </div>
        <p className="text-white/90 text-base">
          Gestiona tu suscripción actual y accede a todos los beneficios de tu plan {plan.name}
        </p>
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">

        {/* Sección: CUENTA */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="w-5 h-5 text-conexia-green" />
            Cuenta
          </h3>
          
          <div className="space-y-3">
            {/* Miembro desde */}
            {memberSince && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Miembro desde</span>
                <span className="font-semibold text-gray-900">
                  {formatMemberSince(memberSince)}
                </span>
              </div>
            )}

            {/* Tipo de plan */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tipo de plan</span>
              <span className="font-semibold text-gray-900">{plan.name}</span>
            </div>

            {/* Estado de la suscripción */}
            {subscription && subscriptionStatus && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Estado</span>
                <SubscriptionStatusBadge status={subscriptionStatus} size="sm" />
              </div>
            )}

            {/* Descripción del plan */}
            {plan.description && (
              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-sm text-gray-700">{plan.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Beneficios del plan */}
        {plan.benefits && plan.benefits.length > 0 && (
          <div className="border-b pb-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Beneficios incluidos
            </h3>
            <ul className="space-y-2">
              {plan.benefits.map((benefit, index) => {
                const isActive = isBenefitActive(benefit.value);
                const isNumeric = typeof benefit.value === 'number';
                const isString = typeof benefit.value === 'string';
                const formattedValue = isString ? formatBenefitValue(benefit.key, benefit.value) : null;
                
                return (
                  <li 
                    key={benefit.id || benefit.key || index}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <FiCheckCircle className="w-5 h-5 text-conexia-green flex-shrink-0 mt-0.5" />
                    <span className="text-sm">
                      {benefit.name || benefit.description || benefit.key}
                      {isNumeric && benefit.value > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-conexia-green text-white text-xs font-bold rounded-full">
                          {benefit.value} mensual{benefit.value !== 1 ? 'es' : ''}
                        </span>
                      )}
                      {isString && formattedValue && (
                        <span className="ml-2 px-2 py-0.5 bg-conexia-green text-white text-xs font-bold rounded-full">
                          {formattedValue}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Sección: INFORMACIÓN DE PAGO - Solo para planes de pago */}
        {!isFreePlan && paymentInfo && (
          <div className="border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-conexia-green" />
              Información de Pago
            </h3>

            <div className="space-y-4">
              {/* Próximo pago */}
              {paymentInfo.nextPaymentAmount !== null && paymentInfo.nextPaymentAmount !== undefined && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-900">
                      <FiDollarSign className="w-5 h-5" />
                      <span className="font-medium">Próximo pago</span>
                    </div>
                    <span className="text-lg font-bold text-blue-900">
                      {formatCurrency(paymentInfo.nextPaymentAmount)}
                    </span>
                  </div>
                  {paymentInfo.nextPaymentDate && (
                    <p className="text-sm text-blue-700 mt-2">
                      Fecha: <span className="font-semibold">{formatPaymentDate(paymentInfo.nextPaymentDate)}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Método de pago */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
                <PaymentMethodCard paymentMethod={paymentInfo.paymentMethod} />
                
                {/* Botón Administrar forma de pago */}
                <Link
                  href="/settings/my-plan?action=payment"
                  className="block w-full text-center px-4 py-2 mt-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <FiCreditCard className="w-4 h-4" />
                    <span>Administrar forma de pago</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Alertas y estados - Solo para planes de pago */}
        {!isFreePlan && (
          <>
            {/* Alerta de suscripción vencida */}
            {isExpired && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-900 mb-1">
                      Suscripción Vencida
                    </h3>
                    <p className="text-sm text-orange-700">
                      Tu suscripción ha vencido. Renuévala para seguir disfrutando de los beneficios.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerta de pago pendiente */}
            {isPendingPayment && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Pago Pendiente
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Hay un pago pendiente. Por favor, completa el proceso de pago para continuar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Alerta de pago fallido */}
            {isPaymentFailed && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">
                      Pago Fallido
                    </h3>
                    <p className="text-sm text-red-700">
                      El último intento de pago falló. Por favor, verifica tu método de pago.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Estado de suscripción activa */}
            {hasActiveSubscription && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-1">
                      Suscripción Activa
                    </h3>
                    <div className="text-sm text-green-700 space-y-1">
                      <p className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        Ciclo: {subscription.billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
                      </p>
                      {subscription.nextPaymentDate && (
                        <p>
                          Próxima renovación: {' '}
                          <span className="font-medium">
                            {format(new Date(subscription.nextPaymentDate), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                          {daysUntilRenewal !== null && (
                            <span className="text-xs ml-2">
                              ({daysUntilRenewal} {daysUntilRenewal === 1 ? 'día' : 'días'})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Plan Free - Llamada a la acción mejorada con estilo del botón mejorar plan */}
        {isFreePlan && (
          <div className="relative bg-gradient-to-r from-[#367d7d]/5 via-[#48a6a7]/8 to-[#367d7d]/5 border-2 border-[#48a6a7]/30 rounded-lg p-5 overflow-hidden">
            {/* Patrón de fondo sutil */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-start gap-3 mb-0">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#48a6a7]/20 to-[#367d7d]/20 border border-[#48a6a7]/30 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#367d7d]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#367d7d] text-lg mb-1">
                  Desbloquea más funcionalidades
                </h3>
                <p className="text-sm text-gray-700">
                  Actualiza tu plan y accede a beneficios exclusivos
                </p>
                <p className="text-sm text-gray-600 mt-4">
                  Tu plan actual: <span className="font-semibold text-[#367d7d]">Free</span>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Plan Basic/Premium - Mostrar plan actual con opción de upgrade */}
        {!isFreePlan && plan.name !== 'Premium' && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-0">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-6 h-6 text-amber-600" />
                  <h3 className="font-bold text-amber-900 text-lg">
                    Desbloquea todo el potencial
                  </h3>
                </div>
                <p className="text-sm text-amber-700">
                  Actualiza a Premium y accede a beneficios exclusivos
                </p>
                <p className="text-sm text-amber-600/70 mt-4">
                  Tu plan actual: <span className="font-semibold">{plan.name}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones - Solo para planes de pago */}
        {!isFreePlan && isExpired && (
          <div className="pt-4 border-t">
            {/* Botón Renovar para suscripciones vencidas */}
            <Link
              href="/settings/my-plan?action=renew"
              className="block w-full text-center px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
            >
              Renovar Suscripción
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
