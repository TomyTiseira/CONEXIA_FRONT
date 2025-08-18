'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

export default function DeleteInternalUserModal({ email, onConfirm, onCancel, loading, onUserDeleted }) {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (msg?.ok) {
      const timeout = setTimeout(() => {
        setMsg(null);
        onCancel();       // Cierra el modal
        if (onUserDeleted) onUserDeleted(); // Refresca grilla después del cierre
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [msg, onCancel, onUserDeleted]);

  const handleSubmit = async () => {
    const result = await onConfirm(); // { ok, text }
    setMsg(result);
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

            <div className="min-h-[40px] text-center text-sm transition-all duration-300 mb-2">
            {msg && (
                <p className={msg.ok ? 'text-green-600' : 'text-red-600'}>
                {msg.text}
                </p>
            )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
            <Button variant="danger" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Eliminando...' : 'Eliminar'}
            </Button>
            <Button variant="cancel" onClick={onCancel} disabled={loading}>
                Cancelar
            </Button>
            </div>
        </div>
    </div>

  );
}
