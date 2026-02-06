import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';
import { getTimeUnitOptions } from '@/utils/timeUnit';
import { X } from 'lucide-react';

export default function ServiceEditModal({ 
  open, 
  onClose, 
  onConfirm, 
  service, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    price: '',
    timeUnit: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (service && open) {
      setFormData({
        price: service.price || '',
        timeUnit: service.timeUnit || ''
      });
      setErrors({});
      setTouched({});
    }
  }, [service, open]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors = {};
    
    // Precio es requerido y debe ser mayor a 1
    if (!formData.price || formData.price.toString().trim() === '') {
      newErrors.price = 'El precio es obligatorio';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 1) {
        newErrors.price = 'El precio debe ser mayor a 1';
      }
    }

    // Unidad de tiempo es obligatoria
    if (!formData.timeUnit || formData.timeUnit.toString().trim() === '') {
      newErrors.timeUnit = 'La unidad de tiempo es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setTouched({ price: true, timeUnit: true });
    if (validateForm()) {
      const updatedData = {
        price: parseFloat(formData.price),
        timeUnit: formData.timeUnit
      };
      
      onConfirm(updatedData);
    }
  };

  const handleClose = () => {
    setFormData({ price: '', timeUnit: '' });
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validar en tiempo real después del primer toque
    if (touched[field]) {
      setTimeout(() => {
        const newErrors = { ...errors };
        
        if (field === 'price') {
          if (!value || value.toString().trim() === '') {
            newErrors.price = 'El precio es obligatorio';
          } else {
            const priceNum = parseFloat(value);
            if (isNaN(priceNum) || priceNum <= 1) {
              newErrors.price = 'El precio debe ser mayor a 1';
            } else {
              delete newErrors.price;
            }
          }
        }
        
        if (field === 'estimatedHours') {
          if (value && value.toString().trim() !== '') {
            const hoursNum = parseInt(value);
            if (isNaN(hoursNum) || hoursNum < 1) {
              newErrors.estimatedHours = 'Las horas estimadas deben ser un número mayor o igual a 1';
            } else {
              delete newErrors.estimatedHours;
            }
          } else {
            delete newErrors.estimatedHours;
          }
        }
        
        setErrors(newErrors);
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]" onClick={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-md mx-4 animate-fadeIn flex flex-col max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-conexia-green">Editar Servicio</h2>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
              <X size={22} />
            </button>
          </div>

          {/* Body scrolleable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            {/* Campos del formulario */}
            <div className="space-y-4">
              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1.01"
                  className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/30 ${
                    touched.price && errors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa el precio"
                  value={formData.price}
                  onChange={e => handleInputChange('price', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, price: true }))}
                  disabled={loading}
                />
                {touched.price && errors.price && (
                  <span className="block text-xs text-red-600 mt-1">{errors.price}</span>
                )}
              </div>

              {/* Unidad de tiempo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad de tiempo <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/30 ${
                    touched.timeUnit && errors.timeUnit ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.timeUnit}
                  onChange={e => handleInputChange('timeUnit', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, timeUnit: true }))}
                  disabled={loading}
                >
                  <option value="">Seleccionar unidad</option>
                  {getTimeUnitOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {touched.timeUnit && errors.timeUnit && (
                  <span className="block text-xs text-red-600 mt-1">{errors.timeUnit}</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button variant="cancel" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || (touched.price && errors.price) || (touched.timeUnit && errors.timeUnit)}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}