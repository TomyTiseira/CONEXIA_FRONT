import React, { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ServiceDeactivateModal({ open, onClose, onConfirm, serviceTitle = 'este servicio' }) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  const handleConfirm = () => {
    setTouched(true);
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
      setTouched(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setTouched(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-md mx-4 animate-fadeIn flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-conexia-green">Confirmar baja de servicio</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
          </div>

          {/* Body scrolleable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <p className="text-sm text-gray-700 mb-2">
              ¿Estás seguro que deseas dar de baja "{serviceTitle}"?
            </p>
            <p className="text-sm text-gray-500 mb-3">
              Por favor, indica el motivo de la baja.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Nota:</strong> Si este servicio tiene contrataciones activas, no podrá ser eliminado hasta que finalices o canceles todas las contrataciones pendientes.
              </p>
            </div>

            <textarea
              className="w-full border rounded-lg p-2 text-sm h-[80px] max-h-[80px] resize-none overflow-y-auto focus:outline-none focus:ring-2 focus:ring-conexia-green/30"
              placeholder="Motivo de la baja (obligatorio)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
            />
            {touched && !reason.trim() && (
              <span className="block text-xs text-red-600 mt-1">El motivo es obligatorio.</span>
            )}
          </div>

          {/* Footer fijo */}
          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button variant="cancel" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={handleConfirm} disabled={!reason.trim()}>
                Confirmar baja
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}