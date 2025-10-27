import React from 'react';
import Button from '@/components/ui/Button';

export default function ReviewDeleteModal({ open, onClose, onConfirm, loading = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-md mx-4 animate-fadeIn flex flex-col p-6">
        <h2 className="text-lg font-semibold text-conexia-green mb-2">Confirmar eliminación de reseña</h2>
        <p className="text-sm text-gray-700 mb-2">
          ¿Estás seguro que deseas eliminar tu reseña?
        </p>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-yellow-800">
            <strong>Advertencia:</strong> Esta acción no se puede deshacer. Una vez eliminada, no podrás recuperar tu reseña.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : 'Confirmar eliminación'}
          </Button>
        </div>
      </div>
    </div>
  );
}
