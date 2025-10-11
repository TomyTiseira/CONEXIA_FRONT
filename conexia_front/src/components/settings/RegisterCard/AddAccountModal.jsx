'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useFetch } from '@/hooks';
import { fetchBanks } from '@/service/payment/paymentFetch';
import { fetchDigitalPlatforms } from '@/service/payment/paymentFetch';

const ACCOUNT_TYPES = [
  { label: 'Caja de ahorro', value: 'savings' },
  { label: 'Cuenta corriente', value: 'checking' }
];

function validateCBU(value) {
  return /^\d{22}$/.test(value);
}

function validateCVU(value) {
  return /^\d{22}$/.test(value);
}

function validateAlias(value) {
  return /^[a-zA-Z0-9.-]{6,20}$/.test(value);
}

function validateCUIT(value) {
  return /^\d{2}-\d{7,8}-\d{1}$/.test(value);
}

export default function AddAccountModal({ open, onClose, onSubmit, existingAccounts = [], initialType = 'bank' }) {
  const [accountType, setAccountType] = useState(initialType); // 'bank' o 'digital'
  const [formData, setFormData] = useState({
    // Campos comunes
    customName: '',
    alias: '',
    holder: '',
    cuit: '',
    // Campos específicos para banco
    bank: '',
    bankAccountType: '',
    cbu: '',
    // Campos específicos para digital
    platform: '',
    cvu: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch bancos y plataformas digitales
  const { data: banks, isLoading: banksLoading, error: banksError } = useFetch(fetchBanks);
  const { data: platforms, isLoading: platformsLoading, error: platformsError } = useFetch(fetchDigitalPlatforms);

  // Actualizar el tipo cuando cambie el initialType
  useEffect(() => {
    setAccountType(initialType);
  }, [initialType]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      customName: '',
      alias: '',
      holder: '',
      cuit: '',
      bank: '',
      bankAccountType: '',
      cbu: '',
      platform: '',
      cvu: ''
    });
    setErrors({});
    setAccountType(initialType);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors = {};

    // PASO 1: Validaciones de campos obligatorios
    if (!formData.alias) newErrors.alias = 'El alias es obligatorio';
    if (!formData.holder) newErrors.holder = 'El titular es obligatorio';
    if (!formData.cuit) newErrors.cuit = 'El CUIT/CUIL es obligatorio';

    if (accountType === 'bank') {
      // Validaciones específicas para banco
      if (!formData.bank) newErrors.bank = 'El banco es obligatorio';
      if (!formData.bankAccountType) newErrors.bankAccountType = 'El tipo de cuenta es obligatorio';
      if (!formData.cbu) newErrors.cbu = 'El CBU es obligatorio';
    } else {
      // Validaciones específicas para digital
      if (!formData.platform) newErrors.platform = 'La plataforma es obligatoria';
      if (!formData.cvu) newErrors.cvu = 'El CVU es obligatorio';
    }

    // PASO 2: Validaciones de formato (solo si los campos tienen valor)
    if (formData.alias && !validateAlias(formData.alias)) {
      newErrors.alias = 'El alias debe tener entre 6 y 20 caracteres (letras, números, puntos y guiones)';
    }

    if (formData.cuit && !validateCUIT(formData.cuit)) {
      newErrors.cuit = 'El CUIT/CUIL debe tener el formato XX-XXXXXXXX-X';
    }

    if (accountType === 'bank' && formData.cbu && !validateCBU(formData.cbu)) {
      newErrors.cbu = 'El CBU debe tener exactamente 22 dígitos numéricos';
    }

    if (accountType === 'digital' && formData.cvu && !validateCVU(formData.cvu)) {
      newErrors.cvu = 'El CVU debe tener exactamente 22 dígitos numéricos';
    }

    // Si hay errores de campos obligatorios o formato, retornar sin validar duplicados
    if (Object.keys(newErrors).length > 0) {
      return { errors: newErrors };
    }

    // PASO 3: Validaciones de duplicados (solo si todos los campos están correctos)
    const duplicateAlias = existingAccounts.some(acc => acc.alias === formData.alias);
    if (duplicateAlias) {
      return { hasDuplicates: true, field: 'alias', message: 'Ya existe una cuenta con este alias registrado' };
    }

    if (accountType === 'bank') {
      // Verificar CBU duplicado (también contra CVU de cuentas digitales)
      const duplicateCBU = existingAccounts.some(acc => 
        acc.cbu === formData.cbu || acc.cvu === formData.cbu
      );
      if (duplicateCBU) {
        return { hasDuplicates: true, field: 'cbu', message: 'Ya existe una cuenta registrada con este número de CBU/CVU' };
      }
    } else {
      // Verificar CVU duplicado (también contra CBU de cuentas bancarias)
      const duplicateCVU = existingAccounts.some(acc => 
        acc.cvu === formData.cvu || acc.cbu === formData.cvu
      );
      if (duplicateCVU) {
        return { hasDuplicates: true, field: 'cvu', message: 'Ya existe una cuenta registrada con este número de CVU/CBU' };
      }
    }

    return { errors: newErrors };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm();
    
    if (validation.hasDuplicates) {
      // Mostrar toast de error por duplicado
      onSubmit(null, validation.message);
      return;
    }

    if (Object.keys(validation.errors).length > 0) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    try {
      let accountData;

      if (accountType === 'bank') {
        const selectedBank = Array.isArray(banks) ? banks.find(b => b.name === formData.bank) : null;
        if (!selectedBank) {
          setErrors({ bank: 'Banco no válido' });
          setLoading(false);
          return;
        }

        accountData = {
          type: 'bank_account',
          bankId: selectedBank.id,
          accountType: formData.bankAccountType,
          cbu: formData.cbu,
          alias: formData.alias,
          holder: formData.holder,
          cuit: formData.cuit,
          customName: formData.customName || null
        };
      } else {
        const selectedPlatform = Array.isArray(platforms) ? platforms.find(p => p.name === formData.platform) : null;
        if (!selectedPlatform) {
          setErrors({ platform: 'Plataforma no válida' });
          setLoading(false);
          return;
        }

        accountData = {
          type: 'digital_account',
          digitalPlatformId: selectedPlatform.id,
          cvu: formData.cvu,
          alias: formData.alias,
          holder: formData.holder,
          cuit: formData.cuit,
          customName: formData.customName || null
        };
      }

      await onSubmit(accountData);
      resetForm();
    } catch (error) {
      console.error('Error al agregar cuenta:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="px-6 pt-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-center text-conexia-green">
            Agregar {accountType === 'bank' ? 'cuenta bancaria' : 'cuenta digital'}
          </h2>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
          {/* Nombre identificador (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green mb-1">
              Nombre identificador (opcional)
            </label>
            <input
              type="text"
              value={formData.customName}
              onChange={(e) => handleFieldChange('customName', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder={accountType === 'bank' ? 'Ej: Mi cuenta sueldo' : 'Ej: Mi MercadoPago'}
              maxLength={40}
            />
          </div>

          {accountType === 'bank' ? (
            <>
              {/* Banco */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green mb-1">
                  Banco <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bank}
                  onChange={(e) => handleFieldChange('bank', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  disabled={banksLoading || banksError}
                >
                  <option value="">
                    {banksLoading ? 'Cargando bancos...' : banksError ? 'Error al cargar bancos' : 'Seleccionar banco'}
                  </option>
                  {Array.isArray(banks) && banks.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
                {errors.bank && <div className="text-red-600 text-xs mt-1">{errors.bank}</div>}
              </div>

              {/* Tipo de cuenta */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green mb-1">
                  Tipo de cuenta <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.bankAccountType}
                  onChange={(e) => handleFieldChange('bankAccountType', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.bankAccountType && <div className="text-red-600 text-xs mt-1">{errors.bankAccountType}</div>}
              </div>

              {/* CBU */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green mb-1">
                  CBU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cbu}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Solo dígitos
                    handleFieldChange('cbu', value);
                  }}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="CBU"
                  maxLength={22}
                />
                {errors.cbu && <div className="text-red-600 text-xs mt-1">{errors.cbu}</div>}
              </div>
            </>
          ) : (
            <>
              {/* Plataforma */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green mb-1">
                  Plataforma <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleFieldChange('platform', e.target.value)}
                  className="w-full border rounded p-2 text-sm"
                  disabled={platformsLoading || platformsError}
                >
                  <option value="">
                    {platformsLoading ? 'Cargando plataformas...' : platformsError ? 'Error al cargar plataformas' : 'Seleccionar plataforma'}
                  </option>
                  {Array.isArray(platforms) && platforms.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
                {errors.platform && <div className="text-red-600 text-xs mt-1">{errors.platform}</div>}
              </div>

              {/* CVU */}
              <div>
                <label className="block text-sm font-semibold text-conexia-green mb-1">
                  CVU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cvu}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Solo dígitos
                    handleFieldChange('cvu', value);
                  }}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="CVU"
                  maxLength={22}
                />
                {errors.cvu && <div className="text-red-600 text-xs mt-1">{errors.cvu}</div>}
              </div>
            </>
          )}

          {/* Campos comunes */}
          {/* Alias */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green mb-1">
              Alias <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.alias}
              onChange={(e) => handleFieldChange('alias', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Alias"
              maxLength={20}
            />
            {errors.alias && <div className="text-red-600 text-xs mt-1">{errors.alias}</div>}
          </div>

          {/* Titular */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green mb-1">
              Titular de la cuenta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.holder}
              onChange={(e) => handleFieldChange('holder', e.target.value)}
              className="w-full border rounded p-2 text-sm"
              placeholder="Nombre completo"
            />
            {errors.holder && <div className="text-red-600 text-xs mt-1">{errors.holder}</div>}
          </div>

          {/* CUIT */}
          <div>
            <label className="block text-sm font-semibold text-conexia-green mb-1">
              CUIT/CUIL del titular <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.cuit}
              onChange={(e) => {
                // Extraer solo los dígitos
                const digits = e.target.value.replace(/\D/g, '');
                let formatted = digits;
                
                // Formatear con guiones
                if (digits.length >= 2) {
                  formatted = digits.slice(0, 2) + '-' + digits.slice(2);
                }
                if (digits.length >= 10) {
                  formatted = digits.slice(0, 2) + '-' + digits.slice(2, 10) + '-' + digits.slice(10, 11);
                }
                
                handleFieldChange('cuit', formatted);
              }}
              className="w-full border rounded p-2 text-sm"
              placeholder="XX-XXXXXXXX-X"
              maxLength={13}
            />
            {errors.cuit && <div className="text-red-600 text-xs mt-1">{errors.cuit}</div>}
          </div>

          </div>
        </div>

        {/* Botones fijos en la parte inferior */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-2">
            <Button 
              variant="success" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Agregando..." : "Confirmar"}
            </Button>
            <Button 
              variant="cancel" 
              type="button" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}