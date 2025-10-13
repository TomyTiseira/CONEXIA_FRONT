import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function EditAccountModal({ open, onClose, account, onSave, loading, error: externalError }) {
  const [alias, setAlias] = useState(account?.alias || '');
  const [customName, setCustomName] = useState(account?.customName || '');
  const [error, setError] = useState('');
  const [existingAliases, setExistingAliases] = useState([]);

  // Sincronizar los valores cuando cambia la cuenta a editar
  useEffect(() => {
  setAlias(account?.alias || '');
  setCustomName(account?.customName || '');
  // Simulación: podrías obtener los alias existentes desde props o contexto global
  setExistingAliases(account?.existingAliases || []);
  }, [account]);

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!alias && !customName) {
      setError('Debes ingresar al menos un dato para editar.');
      return;
    }
    // Validación de alias existente
    if (alias && existingAliases.includes(alias)) {
      setError('El alias ingresado pertenece a otra cuenta registrada.');
      return;
    }
    onSave({ alias, customName });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Editar alias y nombre identificador</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={e => setAlias(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Alias"
              maxLength={40}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Nombre identificador (opcional)</label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="Ej: Mi cuenta MercadoPago"
              maxLength={40}
            />
          </div>
          {(error || externalError) && <div className="text-red-600 text-sm">{error || externalError}</div>}
          <div className="flex gap-2 justify-end mt-2">
            <Button type="button" variant="cancel" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" {...(loading ? { loading: true } : {})}>Guardar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
