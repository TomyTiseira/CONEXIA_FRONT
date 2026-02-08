'use client';

import React from 'react';
import { AlertTriangle, FileText, X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ServiceDeleteConflictModal({ 
  open, 
  onClose, 
  serviceTitle = 'este servicio',
  onViewContracts = null 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-2xl shadow-2xl border border-yellow-200 w-full max-w-md mx-4 animate-fadeIn flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              No se puede eliminar el servicio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-4">
            El servicio <strong>"{serviceTitle}"</strong> no puede ser eliminado porque tiene contrataciones activas.
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">¿Qué puedes hacer?</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Finalizar las contrataciones completadas</li>
              <li>Cancelar las contrataciones pendientes (si es necesario)</li>
              <li>Esperar a que las contrataciones lleguen a su fin natural</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500">
            Una vez que no tengas contrataciones activas, podrás eliminar el servicio sin problemas.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {onViewContracts && (
              <Button
                variant="outline"
                onClick={onViewContracts}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <FileText size={16} />
                Ver contrataciones
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Entendido
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}