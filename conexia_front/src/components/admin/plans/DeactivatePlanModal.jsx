'use client';

import { X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeactivatePlanModal({ plan, onClose, onConfirm, loading }) {
  if (!plan) return null;
  const isActive = plan.active;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-conexia-green flex items-center gap-2">
            {isActive ? 'Desactivar Plan' : 'Activar Plan'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {isActive ? (
            <>
              <p className="text-gray-700 mb-3">
                ¿Querés desactivar el plan <strong>"{plan.name}"</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-2">Esta acción:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Ocultará este plan para nuevas contrataciones.</li>
                <li>Mantendrá las suscripciones actuales hasta su vencimiento.</li>
                <li>Solicitará a los usuarios elegir otro plan al finalizar su ciclo.</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Advertencia:</strong> Los usuarios con suscripciones activas no podrán renovarlas con este plan una vez que finalicen su ciclo actual.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-700 mb-3">
                Vas a activar el plan <strong>"{plan.name}"</strong> para que vuelva a estar disponible.
              </p>
              <p className="text-sm text-gray-600 mb-2">Esta acción:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>Habilita este plan de inmediato para nuevas contrataciones.</li>
                <li>No modifica las suscripciones actuales.</li>
              </ul>
            </>
          )}
        </div>

        <div className="border-t px-6 py-4 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={isActive ? 'danger' : 'add'} onClick={onConfirm} disabled={loading}>
            {loading ? 'Procesando...' : isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
