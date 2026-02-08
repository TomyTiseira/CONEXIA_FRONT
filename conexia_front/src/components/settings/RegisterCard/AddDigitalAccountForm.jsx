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
  // Validación con formato y dígito verificador
  if (!/^\d{2}-\d{7,8}-\d{1}$/.test(value)) return false;
  const digits = value.replace(/-/g, '');
  if (!/^\d{11}$/.test(digits)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const nums = digits.split('').map(d => parseInt(d, 10));
  const checkDigit = nums[10];
  const sum = weights.reduce((acc, w, i) => acc + w * nums[i], 0);
  const mod = sum % 11;
  let computed = 11 - mod;
  if (computed === 11) computed = 0;
  if (computed === 10) computed = 9;
  return computed === checkDigit;
}

export default function AddDigitalAccountForm({ onSubmit, onCancel, existingAccounts = [] }) {
  // Limpiar error de campo al escribir
  const handleFieldChange = (field, valueSetter) => e => {
    valueSetter(e.target.value);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };
  const [touched, setTouched] = useState({});
  const [platform, setPlatform] = useState('');
  const [cvu, setCVU] = useState('');
  const [alias, setAlias] = useState('');
  const [holder, setHolder] = useState('');
  const [cuit, setCUIT] = useState('');
  const [customName, setCustomName] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState({});

  // Fetch plataformas digitales dinámicamente
  const { data: platforms, isLoading: platformsLoading, error: platformsError } = useFetch(fetchDigitalPlatforms);

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    setTouched({
      platform: true,
      cvu: true,
      alias: true,
      holder: true,
      cuit: true
    });
    if (!platform) newErrors.platform = 'Este campo es obligatorio.';
    if (!alias) newErrors.alias = 'Este campo es obligatorio.';
    if (!cvu) newErrors.cvu = 'Este campo es obligatorio.';
    if (!holder) newErrors.holder = 'Este campo es obligatorio.';
    if (!cuit) newErrors.cuit = 'Este campo es obligatorio.';
    if (cvu && !validateCVU(cvu)) newErrors.cvu = 'El CVU debe tener exactamente 22 dígitos.';
    if (alias && !validateAlias(alias)) newErrors.alias = 'El alias debe tener entre 6 y 20 caracteres (letras, números, guiones y puntos).';
    if (cuit) {
      const hasValidFormat = /^\d{2}-\d{7,8}-\d{1}$/.test(cuit);
      if (!hasValidFormat) {
        newErrors.cuit = 'El CUIT/CUIL debe tener formato XX-XXXXXXXX-X.';
      } else if (!validateCUIT(cuit)) {
        newErrors.cuit = 'CUIT/CUIL inválido';
      }
    }
    if (existingAccounts.some(acc => acc.cvu === cvu)) newErrors.cvu = 'Este CVU pertenece a otra cuenta registrada.';
    if (existingAccounts.some(acc => acc.alias === alias)) newErrors.alias = 'Este alias pertenece a otra cuenta registrada.';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
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
      let errorMsg = err?.message || 'Error al registrar la cuenta digital';
      // Si el error es de CVU, mostrar solo en el campo CVU
      if (errorMsg.toLowerCase().includes('cvu')) {
        setErrors(prev => ({ ...prev, cvu: errorMsg }));
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
          value={customName}
          onChange={handleFieldChange('customName', setCustomName)}
          className="w-full border rounded p-2"
          placeholder="Ej: Mi cuenta MercadoPago, para cobros"
          maxLength={40}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Plataforma</label>
        <select value={platform} onChange={handleFieldChange('platform', setPlatform)} className="w-full border rounded p-2" disabled={platformsLoading || platformsError}>
          <option value="">{platformsLoading ? 'Cargando plataformas...' : platformsError ? 'Error al cargar plataformas' : 'Seleccionar plataforma'}</option>
          {Array.isArray(platforms) && platforms.map(p => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
        </select>
        {platformsError && <div className="text-red-600 text-xs mt-1">No se pudieron cargar las plataformas</div>}
        {errors.platform && <div className="text-red-600 text-xs mt-1">{errors.platform}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">Alias</label>
        <input type="text" value={alias} onChange={handleFieldChange('alias', setAlias)} className="w-full border rounded p-2" placeholder="Alias" />
        {errors.alias && <div className="text-red-600 text-xs mt-1">{errors.alias}</div>}
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">CVU</label>
        <input type="text" value={cvu} onChange={handleFieldChange('cvu', setCVU)} className="w-full border rounded p-2" placeholder="CVU" />
        {(cvu && !/^\d{22}$/.test(cvu))
          ? <div className="text-red-600 text-xs mt-1">El CVU debe tener exactamente 22 dígitos numéricos</div>
          : errors.cvu && <div className="text-red-600 text-xs mt-1">{errors.cvu}</div>
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
            if (val.length > 2) val = val.slice(0,2) + '-' + val.slice(2);
            if (val.length > 10) val = val.slice(0,11) + '-' + val.slice(11,12);
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
