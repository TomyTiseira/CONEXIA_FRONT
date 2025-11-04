'use client';

import { X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeletePlanModal({ plan, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-conexia-green flex items-center gap-2">
            Eliminar Plan
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar el plan <strong>"{plan?.name}"</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-2">
            Esta acción:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Eliminará permanentemente este plan del sistema</li>
            <li>Los usuarios que ya lo tienen conservarán su suscripción hasta el vencimiento</li>
            <li>No estará disponible para nuevas contrataciones</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Advertencia:</strong> Esta acción no se puede deshacer. Si solo deseas ocultarlo temporalmente, considera desactivarlo en su lugar.
            </p>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={() => onConfirm(plan.id)}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Eliminar Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
