import React from 'react';
import Button from '@/components/ui/Button';

export default function ConfirmDeleteModal({ open, onClose, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
          </svg>
          Confirmar eliminación
        </h2>
        <p className="mb-6 text-gray-700">¿Estás seguro que deseas eliminar este método de cobro? Esta acción no se puede deshacer.</p>
        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="button" variant="danger" onClick={onConfirm} {...(loading ? { loading: true } : {})}>Eliminar</Button>
        </div>
      </div>
    </div>
  );
}
