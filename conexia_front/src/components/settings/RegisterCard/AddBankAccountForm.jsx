'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

const BANKS = [
  'Banco Nación', 'Banco Galicia', 'Banco Santander', 'Banco Macro', 'Banco BBVA', 'Banco Provincia', 'Banco ICBC', 'Banco Supervielle', 'Banco Patagonia', 'Banco HSBC', 'Banco Credicoop', 'Banco Ciudad', 'Banco Itaú', 'Banco Comafi', 'Banco Brubank', 'Banco Ualá', 'Otro'
];
const ACCOUNT_TYPES = ['Caja de ahorro', 'Cuenta corriente'];

function validateCBU(value) {
  return /^\d{22}$/.test(value);
}
function validateAlias(value) {
  return /^[a-zA-Z0-9.-]{6,20}$/.test(value);
}
function validateCUIT(value) {
  return /^\d{2}-\d{8}-\d{1}$/.test(value);
}

export default function AddBankAccountForm({ onSubmit, onCancel, existingAccounts = [] }) {
  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [cbu, setCBU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!bank || !accountType || !holder || !cuit || (!cbu && !alias)) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (cbu && !validateCBU(cbu)) {
      setError('El CBU debe tener exactamente 22 dígitos.');
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
    if (existingAccounts.some(acc => acc.cbu === cbu || acc.alias === alias)) {
      setError('Esta cuenta ya está registrada.');
      return;
    }
    // Simular validación externa
    // TODO: Integrar con API bancaria/AFIP
    onSubmit({ bank, accountType, cbu, alias, holder, cuit });
  };

  return (
    <form className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-conexia-green mb-2">Agregar cuenta bancaria</h2>
      <div>
        <label className="block text-sm font-semibold mb-1">Banco</label>
        <select value={bank} onChange={e => setBank(e.target.value)} className="w-full border rounded p-2">
          <option value="">Seleccionar banco</option>
          {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Tipo de cuenta</label>
        <select value={accountType} onChange={e => setAccountType(e.target.value)} className="w-full border rounded p-2">
          <option value="">Seleccionar tipo</option>
          {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Alias (opcional)</label>
        <input type="text" value={alias} onChange={e => setAlias(e.target.value)} className="w-full border rounded p-2" placeholder="Alias" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CBU (opcional)</label>
        <input type="text" value={cbu} onChange={e => setCBU(e.target.value)} className="w-full border rounded p-2" placeholder="CBU" />
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
