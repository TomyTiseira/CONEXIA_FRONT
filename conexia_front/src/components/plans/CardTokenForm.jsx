'use client';

import React, { useEffect, useState } from 'react';
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react';
import { config } from '@/config';
import { FiCreditCard, FiAlertCircle } from 'react-icons/fi';

/**
 * Componente para capturar datos de tarjeta y generar token de MercadoPago
 */
export default function CardTokenForm({ 
  plan, 
  billingCycle, 
  onTokenGenerated, 
  onError,
  loading = false 
}) {
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [initError, setInitError] = useState(null);

  const amount = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice) 
    : parseFloat(plan.annualPrice);

  useEffect(() => {
    try {
      if (!config.MERCADOPAGO_PUBLIC_KEY) {
        throw new Error('MercadoPago Public Key no configurada');
      }

      initMercadoPago(config.MERCADOPAGO_PUBLIC_KEY, {
        locale: 'es-AR'
      });
      
      setSdkInitialized(true);
    } catch (error) {
      console.error('Error al inicializar MercadoPago:', error);
      setInitError(error.message);
      onError?.(error);
    }
  }, [onError]);

  const handleSubmit = async (formData) => {
    try {
      if (!formData.token) {
        throw new Error('No se pudo generar el token de la tarjeta');
      }

      // Enviar el token al componente padre
      onTokenGenerated(formData.token);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      onError?.(error);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Error en MercadoPago CardPayment:', error);
    onError?.(error);
  };

  if (initError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 mb-1">
              Error al inicializar el sistema de pagos
            </h4>
            <p className="text-sm text-red-700">{initError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sdkInitialized) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
        <span className="ml-3 text-gray-600">Cargando sistema de pagos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Advertencia de cobro automático */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <FiCreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">
              💳 Cobro automático recurrente
            </p>
            <p className="text-blue-700">
              Esta tarjeta será cargada automáticamente cada{' '}
              <strong>{billingCycle === 'monthly' ? 'mes' : 'año'}</strong> por{' '}
              <strong>{amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}</strong>.
              Puedes cancelar en cualquier momento desde tu panel de usuario.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario de tarjeta de MercadoPago */}
      <div className="border border-gray-200 rounded-lg p-4">
        <CardPayment
          initialization={{ 
            amount,
          }}
          onSubmit={handleSubmit}
          onError={handlePaymentError}
          customization={{
            visual: {
              style: {
                theme: 'default',
              },
              hideFormTitle: true,
            },
            paymentMethods: {
              maxInstallments: 1, // No permitir cuotas para suscripciones
            },
          }}
        />
      </div>

      {loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
            <p className="text-sm text-yellow-800">
              Procesando suscripción, por favor espera...
            </p>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>✓ Tus datos están protegidos con encriptación SSL</p>
        <p>✓ MercadoPago procesará los pagos de forma segura</p>
        <p>✓ Puedes cancelar la suscripción en cualquier momento</p>
      </div>
    </div>
  );
}
