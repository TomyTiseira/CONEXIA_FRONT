'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import InputField from '@/components/form/InputField';
import { useBenefits } from '@/hooks/memberships/useBenefits';

export default function CreatePlanModal({ onClose, onSave, loading }) {
  const { benefits, loading: loadingBenefits } = useBenefits();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    monthlyPrice: '',
    annualPrice: '',
    benefits: [],
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Utilidad para mostrar opciones con la primera letra en mayúscula
  const capitalize = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  // Etiqueta legible para enums: reemplaza _ por espacio y aplica tildes comunes
  const labelify = (val) => {
    if (val === undefined || val === null) return '';
    const base = String(val).toLowerCase().replace(/_/g, ' ');
    const fixes = {
      basicas: 'Básicas',
      básicas: 'Básicas',
      estandar: 'Estándar',
      estándar: 'Estándar',
      maxima: 'máxima',
      mínima: 'mínima',
      minima: 'mínima',
      prioridad: 'Prioridad',
    };
    return base
      .split(' ')
      .map((w) => fixes[w] || w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value || value.trim() === '') {
          newErrors.name = 'El nombre del plan es obligatorio';
        } else if (value.length > 50) {
          newErrors.name = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete newErrors.name;
        }
        break;
      case 'description':
        if (value && value.length > 200) {
          newErrors.description = 'La descripción no puede exceder 200 caracteres';
        } else {
          delete newErrors.description;
        }
        break;
      case 'monthlyPrice':
        if (!value || value === '') {
          newErrors.monthlyPrice = 'El precio mensual es obligatorio';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          newErrors.monthlyPrice = 'Debe ser un número válido mayor o igual a 0';
        } else {
          delete newErrors.monthlyPrice;
        }
        break;
      case 'annualPrice':
        if (!value || value === '') {
          newErrors.annualPrice = 'El precio anual es obligatorio';
        } else if (isNaN(value) || parseFloat(value) < 0) {
          newErrors.annualPrice = 'Debe ser un número válido mayor o igual a 0';
        } else {
          delete newErrors.annualPrice;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBenefitChange = (benefitKey, value, type) => {
    const updatedBenefits = [...formData.benefits];
    const existingIndex = updatedBenefits.findIndex(b => b.key === benefitKey);

    let parsedValue = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : parseInt(value, 10);
    } else if (type === 'boolean') {
      parsedValue = value;
    }

    if (existingIndex >= 0) {
      if ((type === 'boolean' && !parsedValue) || (type === 'number' && parsedValue === 0) || (type === 'enum' && !parsedValue)) {
        updatedBenefits.splice(existingIndex, 1);
      } else {
        updatedBenefits[existingIndex] = { key: benefitKey, value: parsedValue };
      }
    } else {
      if ((type === 'boolean' && parsedValue) || (type === 'number' && parsedValue > 0) || (type === 'enum' && parsedValue)) {
        updatedBenefits.push({ key: benefitKey, value: parsedValue });
      }
    }

    setFormData(prev => ({ ...prev, benefits: updatedBenefits }));

    // Limpiar o establecer error de beneficios según corresponda
    setErrors(prev => {
      const next = { ...prev };
      if (updatedBenefits.length === 0) {
        next.benefits = 'Debes seleccionar al menos un beneficio';
      } else {
        delete next.benefits;
      }
      return next;
    });
  };

  const getBenefitValue = (benefitKey) => {
    const benefit = formData.benefits.find(b => b.key === benefitKey);
    return benefit ? benefit.value : null;
  };

  const isBenefitChecked = (benefit, value = null) => {
    const current = getBenefitValue(benefit.key);
    switch (benefit.type) {
      case 'boolean':
        return current === true;
      case 'number':
        return typeof current === 'number' && current > 0;
      case 'enum':
        return Boolean(current);
      default:
        return false;
    }
  };

  const toggleBenefit = (benefit, checked) => {
    if (!checked) {
      // Remove benefit and re-validate count
      const updated = formData.benefits.filter(b => b.key !== benefit.key);
      setFormData(prev => ({ ...prev, benefits: updated }));
      setErrors(prev => {
        const next = { ...prev };
        if (updated.length === 0) next.benefits = 'Debes seleccionar al menos un beneficio';
        else delete next.benefits;
        return next;
      });
      return;
    }

    // Add with sensible default
    if (benefit.type === 'boolean') {
      handleBenefitChange(benefit.key, true, 'boolean');
    } else if (benefit.type === 'number') {
      handleBenefitChange(benefit.key, 1, 'number');
    } else if (benefit.type === 'enum') {
      const defaultVal = benefit.options?.values?.[0] || '';
      handleBenefitChange(benefit.key, defaultVal, 'enum');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'El nombre del plan es obligatorio';
    } else if (formData.name.length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'La descripción no puede exceder 200 caracteres';
    }

    if (!formData.monthlyPrice || formData.monthlyPrice === '') {
      newErrors.monthlyPrice = 'El precio mensual es obligatorio';
    } else if (isNaN(formData.monthlyPrice) || parseFloat(formData.monthlyPrice) < 0) {
      newErrors.monthlyPrice = 'Debe ser un número válido mayor o igual a 0';
    }

    if (!formData.annualPrice || formData.annualPrice === '') {
      newErrors.annualPrice = 'El precio anual es obligatorio';
    } else if (isNaN(formData.annualPrice) || parseFloat(formData.annualPrice) < 0) {
      newErrors.annualPrice = 'Debe ser un número válido mayor o igual a 0';
    }

    if (!formData.benefits || formData.benefits.length === 0) {
      newErrors.benefits = 'Debes seleccionar al menos un beneficio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como touched
    setTouched({
      name: true,
      description: true,
      monthlyPrice: true,
      annualPrice: true,
    });

    if (!validate()) return;

    const planData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      monthlyPrice: parseFloat(formData.monthlyPrice),
      annualPrice: parseFloat(formData.annualPrice),
      benefits: formData.benefits,
    };

    onSave(planData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        {/* Header fijo */}
        <div className="flex-none border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-conexia-green">Crear plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={22} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">
                Nombre del plan *
              </label>
              <InputField
                type="text"
                placeholder="Ej: Plan Pro"
                value={formData.name}
                onChange={(e) => { handleChange('name', e.target.value); }}
                onBlur={() => handleBlur('name')}
                error={touched.name ? errors.name : ''}
                showCharCount
                maxLength={50}
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-conexia-green mb-1">
                Descripción (Opcional)
              </label>
              <InputField
                multiline
                rows={4}
                placeholder="Describe brevemente este plan..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                error={touched.description ? errors.description : ''}
                showCharCount
                maxLength={200}
              />
            </div>

            {/* Precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-conexia-green mb-1">
                  Precio mensual (ARS) *
                </label>
                <InputField
                  type="number"
                  placeholder="0.00"
                  value={formData.monthlyPrice}
                  onChange={(e) => handleChange('monthlyPrice', e.target.value)}
                  onBlur={() => handleBlur('monthlyPrice')}
                  error={touched.monthlyPrice ? errors.monthlyPrice : ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-conexia-green mb-1">
                  Precio anual (ARS) *
                </label>
                <InputField
                  type="number"
                  placeholder="0.00"
                  value={formData.annualPrice}
                  onChange={(e) => handleChange('annualPrice', e.target.value)}
                  onBlur={() => handleBlur('annualPrice')}
                  error={touched.annualPrice ? errors.annualPrice : ''}
                />
              </div>
            </div>

            {/* Beneficios */}
            <div>
              <h3 className="text-sm font-semibold text-conexia-green mb-2">
                Beneficios del plan *
              </h3>
              {loadingBenefits ? (
                <div className="text-sm text-gray-500">Cargando beneficios...</div>
              ) : (
                <div className="space-y-3">
                  {benefits.map((benefit) => {
                    const checked = isBenefitChecked(benefit);
                    return (
                      <div
                        key={benefit.id}
                        className={`border rounded-lg px-4 py-3 flex flex-col gap-2 ${
                          checked ? 'bg-conexia-green/10 border-conexia-green' : 'bg-white'
                        }`}
                      >
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleBenefit(benefit, e.target.checked)}
                            className="mt-1 w-4 h-4 accent-conexia-green border-gray-300 rounded focus:ring-conexia-green"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">{benefit.name}</div>
                            <div className="text-xs text-gray-500">{benefit.description}</div>
                          </div>
                        </label>

                        {/* Campo asociado (solo si está activo) */}
                        {checked && (
                          <div className="pl-7">
                            {benefit.type === 'number' && (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 min-w-[130px]">Cantidad máxima al mes</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={getBenefitValue(benefit.key) || 1}
                                  onChange={(e) => handleBenefitChange(benefit.key, e.target.value, 'number')}
                                  className="w-24 px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40"
                                />
                              </div>
                            )}
                            {benefit.type === 'enum' && (
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-700 min-w-[130px]">Nivel</span>
                                <select
                                  value={getBenefitValue(benefit.key) || ''}
                                  onChange={(e) => handleBenefitChange(benefit.key, e.target.value, 'enum')}
                                  className="px-3 py-2 border rounded focus:outline-none focus:ring focus:ring-conexia-green/40 min-w-[220px]"
                                >
                                  {benefit.options?.values?.map((val) => (
                                    <option key={val} value={val}>
                                      {labelify(val)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                {errors.benefits && (
                <p className="text-sm text-red-600 mb-2">{errors.benefits}</p>
              )}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer fijo */}
        <div className="flex-none border-t px-6 py-4 flex justify-end gap-3 bg-white">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : 'Crear Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
