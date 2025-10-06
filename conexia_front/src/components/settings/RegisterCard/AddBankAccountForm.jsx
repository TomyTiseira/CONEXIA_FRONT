'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { fetchBanks, addBankAccount } from '@/service/payment/paymentFetch';

const ACCOUNT_TYPES = ['Caja de ahorro', 'Cuenta corriente'];

function validateCBU(value) {
  return /^\d{22}$/.test(value);
}
function validateAlias(value) {
  return /^[a-zA-Z0-9.-]{6,20}$/.test(value);
}
function validateCUIT(value) {
  // Valida formato XX-XXXXXXXX-X o XX-XXXXXXX-X (7 u 8 dígitos en el centro)
  return /^\d{2}-\d{7,8}-\d{1}$/.test(value);
}

export default function AddBankAccountForm({ onSubmit, onCancel, existingAccounts = [] }) {
  const [bank, setBank] = useState('');
  const [accountType, setAccountType] = useState('');
  const [cbu, setCBU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');

  // Fetch bancos dinámicamente
  const { data: banks, isLoading: banksLoading, error: banksError } = useFetch(fetchBanks);

  const handleSubmit = async e => {
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

    // Buscar el objeto banco seleccionado
    const selectedBank = Array.isArray(banks) ? banks.find(b => b.name === bank) : null;
    if (!selectedBank) {
      setError('Banco inválido.');
      return;
    }

    // Mapear tipo de cuenta
    let bankAccountType = '';
    if (accountType === 'Caja de ahorro') bankAccountType = 'savings';
    else if (accountType === 'Cuenta corriente') bankAccountType = 'checking';
    else {
      setError('Tipo de cuenta inválido.');
      return;
    }

    try {
      const result = await addBankAccount({
        bankId: selectedBank.id,
        bankAccountType,
        cbu,
        accountHolderName: holder,
        cuilCuit: cuit, // Enviar con guiones
        alias: alias || undefined,
        customName: cardName
      });
      // Si todo ok, llamar a onSubmit con mensaje de éxito
      onSubmit(result?.message || 'Cuenta bancaria registrada correctamente');
    } catch (err) {
      let errorMsg = err?.message || 'Error al registrar la cuenta bancaria';
      if (errorMsg.includes('Invalid CUIL/CUIT format')) {
        errorMsg = 'El CUIT/CUIL ingresado no es válido. Verifica el formato y los dígitos.';
      }
      if (errorMsg.toLowerCase().includes('ya existe') || errorMsg.toLowerCase().includes('already exists')) {
        errorMsg = 'Este medio de cobro ya está registrado.';
      }
      setError(errorMsg);
    }
  };

  return (
    <form className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-conexia-green mb-2">Agregar cuenta bancaria</h2>
      <div>
        <label className="block text-sm font-semibold mb-1">Banco</label>
        <select value={bank} onChange={e => setBank(e.target.value)} className="w-full border rounded p-2" disabled={banksLoading || banksError}>
          <option value="">{banksLoading ? 'Cargando bancos...' : banksError ? 'Error al cargar bancos' : 'Seleccionar banco'}</option>
          {Array.isArray(banks) && banks.map(b => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>
        {banksError && <div className="text-red-600 text-xs mt-1">No se pudieron cargar los bancos</div>}
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
        <label className="block text-sm font-semibold mb-1">CBU</label>
        <input type="text" value={cbu} onChange={e => setCBU(e.target.value)} className="w-full border rounded p-2" placeholder="CBU" />
  {cbu && (!/^\d{22}$/.test(cbu)) && <div className="text-red-600 text-xs mt-1">El CBU debe tener exactamente 22 dígitos numéricos</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Titular de la cuenta</label>
        <input type="text" value={holder} onChange={e => setHolder(e.target.value)} className="w-full border rounded p-2" placeholder="Nombre completo" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CUIT/CUIL del titular</label>
        <input
          type="text"
          value={cuit}
          onChange={e => {
            let val = e.target.value.replace(/[^\d]/g, ''); // Solo números
            // Formatear: XX-XXXXXXX-X o XX-XXXXXXXX-X
            if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
            if (val.length > 11) val = val.slice(0,11) + '-' + val.slice(11,12);
            if (val.length > 13) val = val.slice(0,13); // Limitar a XX-XXXXXXXX-X
            setCUIT(val);
          }}
          className="w-full border rounded p-2"
          placeholder="XX-XXXXXXXX-X"
          maxLength={13}
        />
      </div>
      <div>
  <label className="block text-sm font-semibold mb-1">Nombre identificador de la cuenta (opcional)</label>
        <input
          type="text"
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Ej: Mi cuenta sueldo, Banco Nación"
          maxLength={40}
        />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-4 justify-end mt-2">
        <Button variant="danger" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Agregar</Button>
      </div>
    </form>
  );
}
