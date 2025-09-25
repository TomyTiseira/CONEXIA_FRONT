import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { formatPrice } from '@/utils/formatPrice';

export default function ServiceEditModal({ 
  open, 
  onClose, 
  onConfirm, 
  service, 
  loading = false 
}) {
  const [formData, setFormData] = useState({
    price: '',
    estimatedHours: ''
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (service && open) {
      setFormData({
        price: service.price || '',
        estimatedHours: service.estimatedHours || ''
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

    // Horas estimadas opcional, pero si se proporciona debe ser >= 1
    if (formData.estimatedHours && formData.estimatedHours.toString().trim() !== '') {
      const hoursNum = parseInt(formData.estimatedHours);
      if (isNaN(hoursNum) || hoursNum < 1) {
        newErrors.estimatedHours = 'Las horas estimadas deben ser un número mayor o igual a 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setTouched({ price: true, estimatedHours: true });
    if (validateForm()) {
      const updatedData = {
        price: parseFloat(formData.price),
        estimatedHours: formData.estimatedHours && formData.estimatedHours.toString().trim() !== '' 
          ? parseInt(formData.estimatedHours) 
          : null
      };
      
      onConfirm(updatedData);
    }
  };

  const handleClose = () => {
    setFormData({ price: '', estimatedHours: '' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#c6e3e4] w-full max-w-md mx-4 animate-fadeIn flex flex-col p-6">
        <h2 className="text-lg font-semibold text-conexia-green mb-2">Editar Servicio</h2>
        <p className="text-sm text-gray-700 mb-4">Actualiza los datos de tu servicio.</p>
        
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
              <span className="text-xs text-red-600 mt-1">{errors.price}</span>
            )}
          </div>

          {/* Horas estimadas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo estimado (opcional)
            </label>
            <input
              type="number"
              min="1"
              className={`w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/30 ${
                touched.estimatedHours && errors.estimatedHours ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Horas"
              value={formData.estimatedHours}
              onChange={e => handleInputChange('estimatedHours', e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, estimatedHours: true }))}
              disabled={loading}
            />
            {touched.estimatedHours && errors.estimatedHours && (
              <span className="text-xs text-red-600 mt-1">{errors.estimatedHours}</span>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="cancel" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading || (touched.price && errors.price) || (touched.estimatedHours && errors.estimatedHours)}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
}