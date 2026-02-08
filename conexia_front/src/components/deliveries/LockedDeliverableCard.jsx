'use client';

import { Lock, AlertCircle } from 'lucide-react';

export default function LockedDeliverableCard({ deliverable, userRole }) {
  const isProvider = userRole === 'SERVICE_OWNER';

  return (
    <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6 relative overflow-hidden">
      {/* Overlay de bloqueo */}
      <div className="absolute inset-0 bg-gray-900/5 pointer-events-none"></div>
      
      <div className="relative">
        {/* Header con ícono de candado */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Lock size={24} className="text-red-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-700">
                {deliverable.title}
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                Bloqueado
              </span>
            </div>
            
            <p className="text-sm text-gray-600">
              Entregable #{deliverable.orderIndex}
            </p>
          </div>
        </div>

        {/* Descripción (difuminada) */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 blur-sm select-none">
            {deliverable.description || 'Descripción del entregable'}
          </p>
        </div>

        {/* Razón del bloqueo */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">
                {isProvider ? '🔒 Debes entregar el entregable anterior primero' : 'Este entregable no está disponible'}
              </p>
              <p className="text-sm text-yellow-700">
                {deliverable.lockReason || (isProvider 
                  ? 'Debes entregar el entregable anterior para poder subir este'
                  : 'Paga el entregable anterior para desbloquear este'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Precio: ${deliverable.price?.toLocaleString()}</span>
          {deliverable.estimatedDeliveryDate && (
            <span>
              Fecha estimada: {new Date(deliverable.estimatedDeliveryDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
