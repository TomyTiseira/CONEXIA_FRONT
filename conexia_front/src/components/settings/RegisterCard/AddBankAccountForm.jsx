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
  const [errors, setErrors] = useState({});

  // Limpiar error de campo al escribir
  const handleFieldChange = (field, valueSetter) => e => {
    valueSetter(e.target.value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Fetch bancos dinámicamente
  const { data: banks, isLoading: banksLoading, error: banksError } = useFetch(fetchBanks);

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!bank) newErrors.bank = 'Este campo es obligatorio.';
    if (!accountType) newErrors.accountType = 'Este campo es obligatorio.';
    if (!holder) newErrors.holder = 'Este campo es obligatorio.';
    if (!cuit) newErrors.cuit = 'Este campo es obligatorio.';
    if (!alias) newErrors.alias = 'Este campo es obligatorio.';
    if (!cbu) newErrors.cbu = 'Este campo es obligatorio.';
    if (cbu && !validateCBU(cbu)) newErrors.cbu = 'El CBU debe tener exactamente 22 dígitos.';
    if (alias && !validateAlias(alias)) newErrors.alias = 'El alias debe tener entre 6 y 20 caracteres (letras, números, guiones y puntos).';
    if (cuit && !validateCUIT(cuit)) newErrors.cuit = 'El CUIT/CUIL debe tener formato XX-XXXXXXXX-X.';
    if (existingAccounts.some(acc => acc.cbu === cbu)) newErrors.cbu = 'Este CBU ya está registrado.';
    if (existingAccounts.some(acc => acc.alias === alias)) newErrors.alias = 'Este alias ya está registrado.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

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
      // Si el error es de CBU, mostrar solo en el campo CBU
      if (errorMsg.toLowerCase().includes('cbu')) {
        setErrors(prev => ({ ...prev, cbu: errorMsg }));
        return;
      }
      // Si el error es de alias, mostrar solo en el campo alias
      if (errorMsg.toLowerCase().includes('alias')) {
        setErrors(prev => ({ ...prev, alias: errorMsg }));
        return;
      }
      // Si el error es de CUIT/CUIL, mostrar solo en el campo cuit
      if (errorMsg.includes('CUIL') || errorMsg.includes('CUIT')) {
        setErrors(prev => ({ ...prev, cuit: errorMsg }));
        return;
      }
      setErrors({ general: errorMsg });
    }
  };

  return (
    <form className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre identificador de la cuenta (opcional)</label>
        <input
          type="text"
          value={cardName}
          onChange={handleFieldChange('cardName', setCardName)}
          className="w-full border rounded p-2"
          placeholder="Ej: Mi cuenta sueldo, Banco Nación"
          maxLength={40}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Banco</label>
        <select value={bank} onChange={handleFieldChange('bank', setBank)} className="w-full border rounded p-2" disabled={banksLoading || banksError}>
          <option value="">{banksLoading ? 'Cargando bancos...' : banksError ? 'Error al cargar bancos' : 'Seleccionar banco'}</option>
          {Array.isArray(banks) && banks.map(b => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>
        {banksError && <div className="text-red-600 text-xs mt-1">No se pudieron cargar los bancos</div>}
        {errors.bank && <div className="text-red-600 text-xs mt-1">{errors.bank}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Tipo de cuenta</label>
        <select value={accountType} onChange={handleFieldChange('accountType', setAccountType)} className="w-full border rounded p-2">
          <option value="">Seleccionar tipo</option>
          {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {errors.accountType && <div className="text-red-600 text-xs mt-1">{errors.accountType}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Alias</label>
        <input type="text" value={alias} onChange={handleFieldChange('alias', setAlias)} className="w-full border rounded p-2" placeholder="Alias" />
        {errors.alias && <div className="text-red-600 text-xs mt-1">{errors.alias}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CBU</label>
        <input type="text" value={cbu} onChange={handleFieldChange('cbu', setCBU)} className="w-full border rounded p-2" placeholder="CBU" />
        {(cbu && !/^\d{22}$/.test(cbu))
          ? <div className="text-red-600 text-xs mt-1">El CBU debe tener exactamente 22 dígitos numéricos</div>
          : errors.cbu && <div className="text-red-600 text-xs mt-1">{errors.cbu}</div>
        }
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Titular de la cuenta</label>
        <input type="text" value={holder} onChange={handleFieldChange('holder', setHolder)} className="w-full border rounded p-2" placeholder="Nombre completo" />
        {errors.holder && <div className="text-red-600 text-xs mt-1">{errors.holder}</div>}
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
            if (errors.cuit) {
              setErrors(prev => ({ ...prev, cuit: undefined }));
            }
          }}
          className="w-full border rounded p-2"
          placeholder="XX-XXXXXXXX-X"
          maxLength={13}
        />
        {errors.cuit && <div className="text-red-600 text-xs mt-1">{errors.cuit}</div>}
      </div>
      {errors.general && <div className="text-red-600 text-sm">{errors.general}</div>}
      <div className="flex gap-4 justify-end mt-2">
        <Button variant="danger" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Agregar</Button>
      </div>
    </form>
  );
}
