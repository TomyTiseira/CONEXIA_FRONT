'use client';

import { X, UserX, Info } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function UserBannedModal({ isOpen, onClose, onAccept }) {
  if (!isOpen) return null;

  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
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
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Info className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Solicitud rechazada automáticamente
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              El usuario solicitante fue dado de baja o baneado. La solicitud ha sido rechazada automáticamente.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Info className="w-4 h-4 inline mr-1" />
                La solicitud ahora aparecerá con estado "rechazada" en tu lista.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button
              onClick={handleAccept}
              className="w-full bg-conexia-green hover:bg-conexia-green/90 text-white"
            >
              Entendido
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}