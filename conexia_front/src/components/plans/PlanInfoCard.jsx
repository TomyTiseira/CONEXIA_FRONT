'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUserPlan } from '@/hooks/memberships';
import PlanBadge from './PlanBadge';

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

  const { plan, subscription, isFreePlan } = data;
  const hasActiveSubscription = subscription && subscription.status === 'active';

  // Calcular días hasta renovación o vencimiento
  let daysUntilRenewal = null;
  if (hasActiveSubscription && subscription.nextPaymentDate) {
    const nextDate = new Date(subscription.nextPaymentDate);
    const today = new Date();
    daysUntilRenewal = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header con gradiente según el plan */}
      <div className={`
        p-6 text-white
        ${plan.name === 'Premium' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
          plan.name === 'Basic' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
          'bg-gradient-to-r from-gray-500 to-gray-600'}
      `}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Tu Plan Actual</h2>
          {plan.name === 'Premium' && <span className="text-3xl">👑</span>}
          {plan.name === 'Basic' && <span className="text-3xl">⚡</span>}
          {plan.name === 'Free' && <span className="text-3xl">⭐</span>}
        </div>
        <p className="text-lg font-semibold">{plan.name}</p>
        {plan.description && (
          <p className="text-sm opacity-90 mt-1">{plan.description}</p>
        )}
      </div>

      {/* Contenido */}
      <div className="p-6 space-y-6">

        {/* Beneficios del plan */}
        {plan.benefits && plan.benefits.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              Beneficios incluidos
            </h3>
            <ul className="space-y-2">
              {plan.benefits.map((benefit, index) => (
                <li 
                  key={benefit.id || benefit.key || index}
                  className="flex items-start gap-3 text-gray-700"
                >
                  <FiCheckCircle className="w-5 h-5 text-conexia-green flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{benefit.name || benefit.description || benefit.key}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Estado de suscripción */}
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

        {/* Plan Free - Llamada a la acción */}
        {isFreePlan && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg mb-1">
                  ⚡ Desbloquea más funcionalidades
                </h3>
                <p className="text-sm text-blue-700">
                  Mejora tu plan y accede a beneficios exclusivos
                </p>
                <p className="text-xs text-blue-600/70 mt-1">
                  Tu plan actual: <span className="font-semibold">Free ⭐</span>
                </p>
              </div>
            </div>
            <Link
              href="/settings/my-plan"
              className="block w-full text-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm shadow-md hover:shadow-lg"
            >
              Ver planes
            </Link>
          </div>
        )}
        
        {/* Plan Basic/Premium - Mostrar plan actual con opción de upgrade */}
        {!isFreePlan && plan.name !== 'Premium' && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-1">
                  👑 Desbloquea todo el potencial
                </h3>
                <p className="text-sm text-amber-700">
                  Actualiza a Premium y accede a beneficios exclusivos
                </p>
                <p className="text-xs text-amber-600/70 mt-1">
                  Tu plan actual: <span className="font-semibold">{plan.name} ⚡</span>
                </p>
              </div>
            </div>
            <Link
              href="/settings/my-plan?action=upgrade"
              className="block w-full text-center px-4 py-2.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors text-sm shadow-md hover:shadow-lg"
            >
              Actualizar a Premium
            </Link>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3 pt-4 border-t">
          {!isFreePlan && (
            <Link
              href="/settings/my-plan"
              className="flex-1 text-center px-4 py-2 border-2 border-conexia-green text-conexia-green rounded-lg font-medium hover:bg-conexia-green hover:text-white transition-colors"
            >
              Administrar Suscripción
            </Link>
          )}
          {plan.name !== 'Premium' && (
            <Link
              href="/settings/my-plan?action=upgrade"
              className="flex-1 text-center px-4 py-2 bg-conexia-green text-white rounded-lg font-medium hover:bg-[#1a7a66] transition-colors"
            >
              {isFreePlan ? 'Mejorar Plan' : 'Actualizar a Premium'}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
