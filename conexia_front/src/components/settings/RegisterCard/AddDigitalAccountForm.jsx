'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

const PLATFORMS = [
  'Mercado Pago', 'Ualá', 'Brubank', 'Naranja X', 'Prex', 'Personal Pay', 'Otro'
];

function validateCVU(value) {
  return /^\d{22}$/.test(value);
}
function validateAlias(value) {
  return /^[a-zA-Z0-9.-]{6,20}$/.test(value);
}
function validateCUIT(value) {
  return /^\d{2}-\d{8}-\d{1}$/.test(value);
}

export default function AddDigitalAccountForm({ onSubmit, onCancel, existingAccounts = [] }) {
  const [platform, setPlatform] = useState('');
  const [cvu, setCVU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!platform || !holder || !cuit || (!cvu && !alias)) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (cvu && !validateCVU(cvu)) {
      setError('El CVU debe tener exactamente 22 dígitos.');
      return;
    }
    if (alias && !validateAlias(alias)) {
      setError('El alias debe tener entre 6 y 20 caracteres (letras, números, guiones y puntos).');
      return;
    }
    if (!validateCUIT(cuit)) {
      setError('El CUIT/CUIL debe tener formato XX-XXXXXXXX-X.');
      return;
    }
    if (existingAccounts.some(acc => acc.cvu === cvu || acc.alias === alias)) {
      setError('Esta cuenta ya está registrada.');
      return;
    }
    // Simular validación externa
    // TODO: Integrar con API externa
    onSubmit({ platform, cvu, alias, holder, cuit });
  };

  return (
    <form className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-conexia-green mb-2">Agregar cuenta digital</h2>
      <div>
        <label className="block text-sm font-semibold mb-1">Plataforma</label>
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full border rounded p-2">
          <option value="">Seleccionar plataforma</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Alias (opcional)</label>
        <input type="text" value={alias} onChange={e => setAlias(e.target.value)} className="w-full border rounded p-2" placeholder="Alias" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CVU (opcional)</label>
        <input type="text" value={cvu} onChange={e => setCVU(e.target.value)} className="w-full border rounded p-2" placeholder="CVU" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Titular de la cuenta</label>
        <input type="text" value={holder} onChange={e => setHolder(e.target.value)} className="w-full border rounded p-2" placeholder="Nombre completo" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CUIT/CUIL del titular</label>
        <input type="text" value={cuit} onChange={e => setCUIT(e.target.value)} className="w-full border rounded p-2" placeholder="XX-XXXXXXXX-X" />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-4 justify-end mt-2">
        <Button variant="danger" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Agregar</Button>
      </div>
    </form>
  );
}
