import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { calculateNextRenewalDate, formatDate } from '@/utils/planUtils';
import CardTokenForm from './CardTokenForm';

/**
 * Modal de confirmación antes de contratar un plan con formulario de tarjeta
 */
export default function ContractConfirmationModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onConfirm,
  loading = false,
}) {
  const [cardToken, setCardToken] = useState(null);
  const [cardError, setCardError] = useState(null);

  if (!isOpen || !plan) return null;

  const price = billingCycle === 'monthly' 
    ? parseFloat(plan.monthlyPrice) 
    : parseFloat(plan.annualPrice);
  
  const renewalDate = calculateNextRenewalDate(billingCycle);
  
  // Formatear precio directamente (el backend ya envía el valor final, no en centavos)
  const formattedPrice = price.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleTokenGenerated = (token) => {
    setCardToken(token);
    setCardError(null);
    
    // Llamar a onConfirm con el token de la tarjeta
    onConfirm(plan.id, billingCycle, token);
  };

  const handleCardError = (error) => {
    setCardError(error?.message || 'Error al procesar la tarjeta');
    setCardToken(null);
  };

  const handleClose = () => {
    if (!loading) {
      setCardToken(null);
      setCardError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            Confirmar contratación
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Plan Info */}
          <div className="bg-gradient-to-br from-conexia-soft to-white border border-conexia-green/20 rounded-xl p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {plan.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {plan.description}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-conexia-green">
                {formattedPrice}
              </span>
              <span className="text-gray-600">
                ARS / {billingCycle === 'monthly' ? 'mes' : 'año'}
              </span>
            </div>
          </div>

          {/* Billing Info */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Ciclo de facturación:</span>
              <span className="font-medium text-gray-900">
                {billingCycle === 'monthly' ? 'Mensual' : 'Anual'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Próxima renovación:</span>
              <span className="font-medium text-gray-900">
                {formatDate(renewalDate)}
              </span>
            </div>

            <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
              <span className="font-medium text-gray-900">Total a pagar:</span>
              <span className="text-xl font-bold text-conexia-green">
                {formattedPrice} <span className="text-sm font-normal text-gray-600">ARS</span>
              </span>
            </div>
          </div>

          {/* Formulario de Tarjeta - NUEVO */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Datos de tu tarjeta
            </h3>
            
            <CardTokenForm
              plan={plan}
              billingCycle={billingCycle}
              onTokenGenerated={handleTokenGenerated}
              onError={handleCardError}
              loading={loading}
            />

            {/* Error de tarjeta */}
            {cardError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Error al procesar la tarjeta</p>
                    <p>{cardError}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Solo botón de cancelar */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
