'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useContractService } from '@/hooks/service-hirings/useContractService';
import Toast from '@/components/ui/Toast';

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
    'Solo puedes contratar servicios con cotización aceptada.'
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

      // Llamar callback de éxito
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Contratar Servicio
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Contenido */}
          <div className="p-6">
            {/* Resumen del servicio */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                {serviceHiring.service?.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Por: {serviceHiring.service?.owner?.firstName} {serviceHiring.service?.owner?.lastName}
              </p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-semibold text-conexia-green">
                  ${serviceHiring.quotedPrice?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {serviceHiring.estimatedHours}h estimadas
                </p>
              </div>
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

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                variant="cancel"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleContract}
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  'Proceder al Pago'
                )}
              </Button>
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