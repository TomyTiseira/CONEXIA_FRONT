'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks/useFetch';
import { fetchDigitalPlatforms, addDigitalAccount } from '@/service/payment/paymentFetch';

function validateCVU(value) {
  return /^\d{22}$/.test(value);
}
function validateAlias(value) {
  return /^[a-zA-Z0-9.-]{6,20}$/.test(value);
}
function validateCUIT(value) {
  // Valida formato XX-XXXXXXXX-X y que los dígitos sean válidos
  if (!/^\d{2}-\d{7,8}-\d{1}$/.test(value)) return false;
  const parts = value.split('-');
  if (parts.length !== 3) return false;
  if (parts[0].length !== 2 || !/\d{2}/.test(parts[0])) return false;
  if (parts[1].length < 7 || parts[1].length > 8 || !/\d{7,8}/.test(parts[1])) return false;
  if (parts[2].length !== 1 || !/\d{1}/.test(parts[2])) return false;
  return true;
}

export default function AddDigitalAccountForm({ onSubmit, onCancel, existingAccounts = [] }) {
  const [touched, setTouched] = useState({});
  const [platform, setPlatform] = useState('');
  const [cvu, setCVU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [cardName, setCardName] = useState('');
  const [customName, setCustomName] = useState('');
  const [error, setError] = useState('');

  // Fetch plataformas digitales dinámicamente
  const { data: platforms, isLoading: platformsLoading, error: platformsError } = useFetch(fetchDigitalPlatforms);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    // Validar campos obligatorios y marcar como tocados
    setTouched({
      platform: true,
      cvu: true,
      holder: true,
      cuit: true
    });
    const missingFields = [];
    if (!platform) missingFields.push('platform');
    if (!cvu) missingFields.push('cvu');
    if (!holder) missingFields.push('holder');
    if (!cuit) missingFields.push('cuit');
    if (missingFields.length > 0) {
      setError('Se deben cargar todos los datos obligatorios del formulario.');
      return;
    }
    if (!validateCVU(cvu)) {
      setError('El CVU debe tener exactamente 22 dígitos.');
      return;
    }
    if (!validateAlias(alias)) {
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
    // Enviar datos correctamente al backend
    const selectedPlatform = Array.isArray(platforms) ? platforms.find(p => p.name === platform) : null;
    if (!selectedPlatform) {
      setError('Plataforma inválida.');
      return;
    }
    try {
      const result = await addDigitalAccount({
        digitalPlatformId: selectedPlatform.id,
        cvu,
        alias: alias || undefined,
        accountHolderName: holder,
        cuilCuit: cuit,
        customName
      });
      if (onSubmit) onSubmit(result?.message || 'Cuenta digital registrada correctamente');
    } catch (err) {
      setError(err?.message || 'Error al registrar la cuenta digital');
    }
  };

  return (
    <form className="bg-white rounded-2xl shadow p-6 max-w-lg mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-conexia-green mb-2">Agregar cuenta digital</h2>
      {/* Plataforma */}
      <div>
        <label className="block text-sm font-semibold mb-1">Plataforma</label>
        <select value={platform} onChange={e => { setPlatform(e.target.value); setTouched(t => ({...t, platform: true})); }} className="w-full border rounded p-2" disabled={platformsLoading || platformsError}>
          <option value="">{platformsLoading ? 'Cargando plataformas...' : platformsError ? 'Error al cargar plataformas' : 'Seleccionar plataforma'}</option>
          {Array.isArray(platforms) && platforms.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        {platformsError && <div className="text-red-600 text-xs mt-1">No se pudieron cargar las plataformas</div>}
        {touched.platform && !platform && <div className="text-red-600 text-xs mt-1">Este campo es obligatorio</div>}
      </div>
      {/* Alias */}
      <div>
        <label className="block text-sm font-semibold mb-1">Alias (opcional)</label>
        <input type="text" value={alias} onChange={e => { setAlias(e.target.value); }} className="w-full border rounded p-2" placeholder="Alias" />
      </div>
      {/* CVU */}
      <div>
        <label className="block text-sm font-semibold mb-1">CVU</label>
        <input type="text" value={cvu} onChange={e => { setCVU(e.target.value); setTouched(t => ({...t, cvu: true})); }} className="w-full border rounded p-2" placeholder="CVU" />
  {cvu && (!/^\d{22}$/.test(cvu)) && <div className="text-red-600 text-xs mt-1">El CVU debe tener exactamente 22 dígitos numéricos</div>}
        {touched.cvu && !cvu && <div className="text-red-600 text-xs mt-1">Este campo es obligatorio</div>}
      </div>
      {/* Titular */}
      <div>
        <label className="block text-sm font-semibold mb-1">Titular de la cuenta</label>
        <input type="text" value={holder} onChange={e => { setHolder(e.target.value); setTouched(t => ({...t, holder: true})); }} className="w-full border rounded p-2" placeholder="Nombre completo" />
        {touched.holder && !holder && <div className="text-red-600 text-xs mt-1">Este campo es obligatorio</div>}
      </div>
      {/* CUIT/CUIL */}
      <div>
        <label className="block text-sm font-semibold mb-1">CUIT/CUIL del titular</label>
        <input
          type="text"
          value={cuit}
          onChange={e => {
            let val = e.target.value.replace(/[^\d]/g, ''); // Solo números
            if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
            if (val.length > 10) val = val.slice(0,11) + '-' + val.slice(11,12);
            if (val.length > 13) val = val.slice(0,13); // Limitar a XX-XXXXXXXX-X
            setCUIT(val);
            setTouched(t => ({...t, cuit: true}));
          }}
          className="w-full border rounded p-2"
          placeholder="XX-XXXXXXXX-X"
          maxLength={13}
        />
        {touched.cuit && !cuit && <div className="text-red-600 text-xs mt-1">Este campo es obligatorio</div>}
      </div>
      {/* Nombre identificador */}
      <div>
        <label className="block text-sm font-semibold mb-1">Nombre identificador de la cuenta (opcional)</label>
        <input
          type="text"
          value={customName}
          onChange={e => setCustomName(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Ej: Mi cuenta MercadoPago, para cobros"
          maxLength={40}
        />
      </div>
      {/* Error general */}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-4 justify-end mt-2">
        <Button variant="danger" type="button" onClick={onCancel}>Cancelar</Button>
        <Button variant="primary" type="submit">Agregar</Button>
      </div>
    </form>
  );
}
