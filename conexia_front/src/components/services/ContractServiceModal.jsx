'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useContractService } from '@/hooks/service-hirings/useContractService';
import Toast from '@/components/ui/Toast';
import { getUnitLabelPlural } from '@/utils/timeUnit';

const PAYMENT_METHODS = [
  {
    id: 'credit_card',
    label: 'Tarjeta de crédito',
    icon: CreditCard,
    description: 'Pago seguro con tarjeta de crédito'
  },
  {
    id: 'debit_card', 
    label: 'Tarjeta de débito',
    icon: Smartphone,
    description: 'Pago directo desde tu cuenta bancaria'
  },
  {
    id: 'bank_transfer',
    label: 'Transferencia bancaria',
    icon: Building2,
    description: 'Transferencia directa desde tu banco'
  }
];

const ERROR_MESSAGES = {
  'User does not have payment accounts configured':
    'Debes configurar al menos una cuenta de pago antes de contratar servicios.',
  'User is banned':
    'Tu cuenta está suspendida. Contacta al soporte.',
  'ServiceHiring not found':
    'La solicitud de servicio no existe.',
  'ServiceHiring is not in accepted status':
    'Solo puedes contratar servicios con cotización aceptada.',
  'missing_payment_accounts':
    'Debes configurar al menos una cuenta de pago antes de contratar servicios.',
  'user_banned':
    'Tu cuenta está suspendida. Contacta al soporte.',
  'invalid_status':
    'Solo puedes contratar servicios con cotización aceptada.',
  'payment_by_deliverables':
    'Este servicio utiliza pago por entregables. Debes pagar cada entregable individualmente según se vayan completando.',
  'Para servicios con pago por entregables, debe pagar cada entregable individualmente':
    'Este servicio utiliza pago por entregables. Debes pagar cada entregable individualmente según se vayan completando.'
};

export default function ContractServiceModal({
  serviceHiring,
  isOpen,
  onClose,
  onSuccess
}) {
  const { contractHiring, loading } = useContractService();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  const [toast, setToast] = useState(null);

  if (!isOpen || !serviceHiring) return null;

  const handleContract = async () => {

    try {
      const result = await contractHiring(serviceHiring.id, selectedPaymentMethod);
    
      // Si llegamos aquí, significa que la redirección no funcionó
      // (normalmente el usuario debería ser redirigido a MercadoPago)
      setToast({
        type: 'warning',
        message: 'Si no fuiste redirigido a MercadoPago, revisa tu bloqueador de popups.',
        isVisible: true
      });

      if (onSuccess) {
        onSuccess(result);
      }

      // Cerrar modal después de un momento
      setTimeout(() => {
        onClose();
      }, 3000);

    } catch (error) {
      // Obtener mensaje de error personalizado
      const errorMessage = ERROR_MESSAGES[error.message] || 
                          ERROR_MESSAGES[error.errorType] || 
                          error.message || 
                          'Error al contratar el servicio';

      setToast({
        type: 'error',
        message: errorMessage,
        isVisible: true
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={handleClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
          <div
            className="relative z-10 bg-white rounded-lg shadow-xl max-w-md w-full min-w-[300px] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header fijo */}
          <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Contratar servicio</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Resumen del servicio */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2 break-words overflow-wrap-anywhere line-clamp-2 leading-tight max-w-full">
                {serviceHiring.service?.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2 break-words">
                Por: {serviceHiring.service?.owner?.firstName} {serviceHiring.service?.owner?.lastName}
              </p>
              
              {/* Mostrar desglose si es modalidad de pago total */}
              {serviceHiring.paymentModality?.code === 'full_payment' ? (
                <>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-sm text-gray-600">Precio total del servicio:</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${serviceHiring.quotedPrice?.toLocaleString()}
                    </p>
                  </div>
                  <div className="border-t border-gray-300 pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Anticipo (25%)</p>
                        <p className="text-xs text-gray-500">Pagarás ahora</p>
                      </div>
                      <p className="text-xl font-bold text-conexia-green">
                        ${Math.round(serviceHiring.quotedPrice * 0.25).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex justify-between items-center text-gray-600">
                      <div>
                        <p className="text-sm">Al completar (75%)</p>
                        <p className="text-xs text-gray-500">Pagarás al finalizar</p>
                      </div>
                      <p className="text-sm font-medium">
                        ${Math.round(serviceHiring.quotedPrice * 0.75).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {serviceHiring.estimatedHours && serviceHiring.estimatedTimeUnit && (
                    <p className="text-xs text-gray-500 mt-2">
                      {serviceHiring.estimatedHours} {getUnitLabelPlural(serviceHiring.estimatedTimeUnit)} estimadas
                    </p>
                  )}
                </>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-conexia-green">
                    ${serviceHiring.quotedPrice?.toLocaleString()}
                  </p>
                  {serviceHiring.estimatedHours && serviceHiring.estimatedTimeUnit && (
                    <p className="text-sm text-gray-500">
                      {serviceHiring.estimatedHours} {getUnitLabelPlural(serviceHiring.estimatedTimeUnit)} estimadas
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Selector de método de pago */}
            <div className="mb-6">
              <h5 className="font-medium text-gray-900 mb-3">
                Método de pago
              </h5>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <label 
                      key={method.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-conexia-green bg-conexia-green/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <IconComponent 
                        size={20} 
                        className={`mr-3 ${
                          selectedPaymentMethod === method.id 
                            ? 'text-conexia-green' 
                            : 'text-gray-400'
                        }`} 
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.label}
                        </div>
                        <div className="text-sm text-gray-500">
                          {method.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Advertencia sobre cuentas de pago */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Nota:</strong> Necesitas tener configurada al menos una cuenta de pago 
                para proceder con la contratación.{' '}
                <a 
                  href="/settings/payment-accounts" 
                  className="text-conexia-green hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Configurar cuentas de pago
                </a>
              </p>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-3">
              <Button
                variant="cancel"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleContract}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  'Proceder al pago'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </>
  );
}