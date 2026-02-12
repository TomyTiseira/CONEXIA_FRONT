'use client';

import React, { useState } from 'react';
import { FiCreditCard } from 'react-icons/fi';
import Toast from '@/components/ui/Toast';
import { fetchWithRefresh } from '@/service/auth/fetchWithRefresh';
import { config } from '@/config';

/**
 * ✅ NUEVO COMPONENTE: Redirect Flow de MercadoPago
 * Ya no necesita generar tokens de tarjeta
 * El usuario ingresa su tarjeta directamente en MercadoPago
 */
export default function ContractPlanButton({ plan, billingCycle, onError }) {
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const amount = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice) 
    : parseFloat(plan.annualPrice);

  const handleContractPlan = async () => {
    setProcessing(true);
    try {
      // Guardar datos de la suscripción pendiente en localStorage
      const subscriptionData = {
        planId: plan.id,
        planName: plan.name,
        amount: amount,
        billingCycle: billingCycle,
        timestamp: new Date().toISOString(),
        status: 'processing'
      };
      localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData));

      // ✅ LLAMAR AL BACKEND SIN TOKEN DE TARJETA (usando fetchWithRefresh para auth con cookies)
      const response = await fetchWithRefresh(`${config.API_URL}/memberships/contract-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: billingCycle, // 'monthly' o 'annual' (lowercase)
          cardTokenId: '' // String vacío para redirect flow
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al contratar el plan');
      }

      const responseData = await response.json();
      
      // El backend retorna data anidado: response.data.data
      const data = responseData.data?.data || responseData.data || responseData;

      // Actualizar datos con la info del backend
      subscriptionData.subscriptionId = data.subscriptionId;
      subscriptionData.expiresAt = data.expiresAt;
      subscriptionData.mercadoPagoSubscriptionId = data.mercadoPagoSubscriptionId;
      localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionData));

      // ✅ REDIRIGIR A MERCADOPAGO
      const redirectUrl = data.mercadoPagoUrl || data.initPoint;
      if (redirectUrl) {
        // Usar window.location.href para redirección completa
        window.location.href = redirectUrl;
      } else {
        throw new Error('No se recibió el link de pago de MercadoPago');
      }

    } catch (error) {
      // Limpiar datos pendientes en caso de error
      localStorage.removeItem('pendingSubscription');
      // Usar el handler para mostrar mensaje limpio
      const errorInfo = require('@/utils/planErrorHandler').handlePlanError(error);
      setToast({
        type: errorInfo.type || 'error',
        message: errorInfo.message || 'Error al procesar la contratación. Por favor intenta nuevamente.',
        isVisible: true
      });
      onError?.(errorInfo);
      setProcessing(false);
    }
    // No se ejecuta finally porque la redirección abandona la página
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiCreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Cobro automático recurrente</p>
            <p className="text-blue-700">
              Esta tarjeta será cargada automáticamente cada <strong>{billingCycle === 'monthly' ? 'mes' : 'año'}</strong> por <strong>{amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>. Puedes cancelar en cualquier momento desde tu panel de usuario.
            </p>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Confirmar suscripción</h3>
        <p className="text-gray-600 mb-6">
          Serás redirigido a <strong>MercadoPago</strong> para ingresar los datos de tu tarjeta de forma segura.
        </p>

        <button
          onClick={handleContractPlan}
          disabled={processing}
          className="w-full bg-conexia-green text-white py-3 rounded-lg font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Procesando...
            </span>
          ) : (
            'Continuar a MercadoPago'
          )}
        </button>
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Tus datos están protegidos por MercadoPago</p>
        <p>✓ Procesamiento seguro garantizado</p>
        <p>✓ Puedes cancelar la suscripción en cualquier momento</p>
      </div>

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          duration={6000}
        />
      )}
    </div>
  );
}
