'use client';

import { useRouter } from 'next/navigation';
import { X, AlertCircle, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PaymentAccountRequiredModal({ isOpen, onClose }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleGoToPaymentAccounts = () => {
    // Redireccionar a la sección de configuración de cuenta donde se pueden gestionar las cuentas de pago
    router.push('/settings/payment');
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Cuenta de pago requerida
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-gray-700 leading-relaxed">
              Para generar una cotización debes tener al menos una cuenta bancaria o digital activa registrada.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGoToPaymentAccounts}
              className="w-full bg-conexia-green hover:bg-conexia-green/90 text-white"
            >
              Ir a cuentas de pago
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}