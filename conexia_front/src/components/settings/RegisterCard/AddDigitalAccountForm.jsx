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
  const [platform, setPlatform] = useState('');
  const [cvu, setCVU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [error, setError] = useState('');

  // Fetch plataformas digitales dinámicamente
  const { data: platforms, isLoading: platformsLoading, error: platformsError } = useFetch(fetchDigitalPlatforms);

  const handleSubmit = async e => {
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

    // Buscar el objeto plataforma seleccionada
    const selectedPlatform = Array.isArray(platforms) ? platforms.find(p => p.name === platform) : null;
    if (!selectedPlatform) {
      setError('Plataforma inválida.');
      return;
    }

    try {
      const result = await addDigitalAccount({
        digitalPlatformId: selectedPlatform.id,
        cvu,
        accountHolderName: holder,
        cuilCuit: cuit, // Enviar con guiones
        alias: alias || undefined
      });
      // Si todo ok, llamar a onSubmit con mensaje de éxito
      onSubmit(result?.message || 'Cuenta digital registrada correctamente');
    } catch (err) {
      let errorMsg = err?.message || 'Error al registrar la cuenta digital';
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
      <h2 className="text-lg font-semibold text-conexia-green mb-2">Agregar cuenta digital</h2>
      <div>
        <label className="block text-sm font-semibold mb-1">Plataforma</label>
        <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full border rounded p-2" disabled={platformsLoading || platformsError}>
          <option value="">{platformsLoading ? 'Cargando plataformas...' : platformsError ? 'Error al cargar plataformas' : 'Seleccionar plataforma'}</option>
          {Array.isArray(platforms) && platforms.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        {platformsError && <div className="text-red-600 text-xs mt-1">No se pudieron cargar las plataformas</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Alias (opcional)</label>
        <input type="text" value={alias} onChange={e => setAlias(e.target.value)} className="w-full border rounded p-2" placeholder="Alias" />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CVU</label>
        <input type="text" value={cvu} onChange={e => setCVU(e.target.value)} className="w-full border rounded p-2" placeholder="CVU" />
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
            if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
            if (val.length > 10) val = val.slice(0,11) + '-' + val.slice(11,12);
            if (val.length > 13) val = val.slice(0,13); // Limitar a XX-XXXXXXXX-X
            setCUIT(val);
          }}
          className="w-full border rounded p-2"
          placeholder="XX-XXXXXXXX-X"
          maxLength={13}
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
