'use client';

import { X, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function RequestRevisionModal({
  isOpen,
  onClose,
  onSubmit,
  notes,
  setNotes,
  loading = false,
  title = 'Solicitar Revisión',
  maxLength = 500,
  minLength = 20,
}) {
  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!loading) onClose?.();
  };

  const handleCloseClick = () => {
    if (!loading) onClose?.();
  };

  const handleSubmit = async () => {
    if (loading) return;
    await onSubmit?.();
  };

  const trimmed = (notes || '').trim();
  const canSubmit = trimmed.length >= minLength && !loading;

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleBackdropClick}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0 flex justify-between items-center">
            <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
              <RefreshCw size={18} className="text-orange-600" />
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
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                Explicá qué necesita ser modificado o corregido para poder aprobar la entrega.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Notas de revisión
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes?.(e.target.value)}
                placeholder="Ej: Falta adjuntar el archivo final, corregir el acceso, actualizar capturas..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={5}
                maxLength={maxLength}
                disabled={loading}
              />
              <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                <span>Mínimo {minLength} caracteres</span>
                <span className={trimmed.length >= minLength ? 'text-orange-600' : 'text-gray-500'}>
                  {(notes || '').length} / {maxLength}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex-shrink-0">
            <div className="flex justify-end gap-3">
              <Button variant="cancel" onClick={handleCloseClick} disabled={loading}>
                Cancelar
              </Button>
              <Button variant="warning" onClick={handleSubmit} disabled={!canSubmit}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  'Enviar Solicitud'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
