import React, { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { calculateNextRenewalDate, formatDate } from '@/utils/planUtils';
import ContractPlanButton from './ContractPlanButton';
import Toast from '@/components/ui/Toast';

/**
 * ✅ ACTUALIZADO: Modal de confirmación con Redirect Flow
 * Ya no genera tokens, redirige a MercadoPago
 */
export default function ContractConfirmationModal({
  isOpen,
  onClose,
  plan,
  billingCycle,
  onConfirm,
  loading = false,
  backendError = null,
}) {
  const [toast, setToast] = useState(null);

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

  const handleError = (error) => {
    setToast({
      type: 'error',
      message: error?.message || 'Error al procesar la suscripción. Por favor intenta nuevamente.',
      isVisible: true
    });
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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

          {/* Botón de contratación con Redirect Flow */}
          <div className="border-t border-gray-200 pt-4">
            <ContractPlanButton
              plan={plan}
              billingCycle={billingCycle}
              onError={handleError}
            />
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Toast de notificaciones */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
          duration={7000}
        />
      )}
    </div>
  );
}
