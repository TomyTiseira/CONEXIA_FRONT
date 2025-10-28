'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Ban, ShieldCheck, Eye } from 'lucide-react';

/**
 * Botones de acción para resolver un análisis
 */
export default function ActionButtons({ analysis, onResolve, disabled = false }) {
  const [selectedAction, setSelectedAction] = useState(null);
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Si ya está resuelto, mostrar la acción tomada
  if (analysis.resolved) {
    const actionLabels = {
      ban_user: 'Usuario Baneado',
      release_user: 'Usuario Liberado',
      keep_monitoring: 'En Monitoreo',
    };

    const actionColors = {
      ban_user: 'bg-red-100 text-red-800',
      release_user: 'bg-green-100 text-green-800',
      keep_monitoring: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <div className="space-y-3">
        <div className={`p-4 rounded-lg border ${actionColors[analysis.resolutionAction] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>  
          <div className="font-semibold text-lg mb-2 flex items-center gap-2">
            Acción:
            <span className="px-2 py-1 rounded text-base font-bold capitalize bg-white/60 border border-gray-300 ml-2">
              {actionLabels[analysis.resolutionAction] || 'Sin acción registrada'}
            </span>
          </div>
          <div className="mb-2 text-sm">
            <strong>Notas:</strong>{' '}
            {analysis.resolutionNotes
              ? <span className="inline-block ml-1 text-gray-800">{analysis.resolutionNotes}</span>
              : <span className="inline-block ml-1 text-gray-400 italic">No se incluyeron notas adicionales en la resolución.</span>
            }
          </div>
          {analysis.resolvedByEmail && (
            <div className="text-xs mt-2 opacity-75">
              Resuelto por: <span className="font-medium text-conexia-green">{analysis.resolvedByEmail}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleActionClick = (action) => {
    setSelectedAction(action);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onResolve(selectedAction, notes);
    setShowConfirm(false);
    setNotes('');
    setSelectedAction(null);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setNotes('');
    setSelectedAction(null);
  };

  if (showConfirm) {
    const actionLabels = {
      ban_user: 'Banear Usuario',
      release_user: 'Liberar Usuario',
      keep_monitoring: 'Seguir Monitoreando',
    };

    return (
      <div className="space-y-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
        <h4 className="font-semibold text-lg text-gray-800">
          Confirmar: {actionLabels[selectedAction]}
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas del moderador (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Agregar observaciones sobre esta decisión..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="success"
            onClick={handleConfirm}
            disabled={disabled}
            className="flex-1"
          >
            Confirmar
          </Button>
          <Button
            variant="cancel"
            onClick={handleCancel}
            disabled={disabled}
            className="flex-1"
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800 mb-3">Acciones disponibles:</h4>
      
      {/* Banear Usuario */}
      <button
        onClick={() => handleActionClick('ban_user')}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
          <Ban className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-red-800">Banear Usuario</div>
          <div className="text-xs text-red-600">
            Suspende la cuenta del usuario reportado
          </div>
        </div>
      </button>

      {/* Liberar Usuario */}
      <button
        onClick={() => handleActionClick('release_user')}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-green-800">Liberar Usuario</div>
          <div className="text-xs text-green-600">
            Los reportes son infundados, no se toma acción
          </div>
        </div>
      </button>

      {/* Seguir Monitoreando */}
      <button
        onClick={() => handleActionClick('keep_monitoring')}
        disabled={disabled}
        className="w-full flex items-center gap-3 px-4 py-3 bg-yellow-50 hover:bg-yellow-100 border-2 border-yellow-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-yellow-800">Seguir Monitoreando</div>
          <div className="text-xs text-yellow-600">
            Marca como resuelto pero continúa vigilando al usuario
          </div>
        </div>
      </button>
    </div>
  );
}
