'use client';

import { X, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ConfirmApproveDeliveryModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = 'Confirmar aprobación de entrega',
}) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!loading) onClose?.();
  };

  const handleCloseClick = () => {
    if (!loading) onClose?.();
  };

  const handleConfirm = async () => {
    if (loading) return;
    await onConfirm?.();
  };

  return (
    <div className="fixed inset-0 z-[110]" onClick={handleBackdropClick}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0 flex justify-between items-center">
            <h3 className="text-xl font-bold text-green-600 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              {title}
            </h3>
            <button
              onClick={handleCloseClick}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
              aria-label="Cerrar"
              title="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-0">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">¿Seguro que querés aprobar esta entrega?</p>
              <p className="text-sm text-green-700 mt-1">
                Esta acción no se puede deshacer. Se procesará el pago correspondiente al prestador.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-3">
              <Button variant="cancel" onClick={handleCloseClick} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="green" onClick={handleConfirm} disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  'Sí, aprobar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
