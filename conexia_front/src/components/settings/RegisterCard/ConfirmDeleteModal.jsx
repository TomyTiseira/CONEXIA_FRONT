import React from 'react';
import Button from '@/components/ui/Button';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, loading, accountType }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">¿Confirmar eliminación?</h2>
        <p className="mb-4 text-gray-700">
          ¿Estás seguro que deseas eliminar esta {accountType === 'bank' ? 'cuenta bancaria' : 'cuenta digital'}? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="button" variant="danger" onClick={onConfirm} loading={loading}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}
