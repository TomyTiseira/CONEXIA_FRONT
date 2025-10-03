'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

export default function DeleteInternalUserModal({ email, onConfirm, onCancel, loading, onUserDeleted, onError }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await onConfirm(); // Se espera que retorne { ok, text }
      if (result?.ok) {
        if (onUserDeleted) onUserDeleted(result.text);
        onCancel();
      } else {
        if (onError) onError(result?.text || 'Error al eliminar usuario interno.');
      }
    } catch (e) {
      if (onError) onError('Error al eliminar usuario interno.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg">
            <h2 className="text-xl font-bold text-center mb-4 text-conexia-green">
            Confirmar eliminación
            </h2>

            <p className="text-sm text-conexia-green text-center mb-4 whitespace-normal md:whitespace-nowrap">
            ¿Estás seguro que deseas eliminar al usuario <span className="font-semibold">{email}</span>?
            </p>

      {/* Mensajes internos eliminados: ahora se muestran vía Toast externo */}

            <div className="flex justify-end gap-2 mt-4">
      <Button variant="danger" onClick={handleSubmit} disabled={loading || submitting}>
        {loading || submitting ? 'Eliminando...' : 'Eliminar'}
            </Button>
      <Button variant="cancel" onClick={onCancel} disabled={loading || submitting}>
                Cancelar
            </Button>
            </div>
        </div>
    </div>

  );
}
