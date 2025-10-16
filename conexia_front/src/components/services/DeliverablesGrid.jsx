'use client';

import { useEffect, useRef } from 'react';
import { Trash2, Plus, Calendar, DollarSign } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * Componente para gestionar la grilla de entregables
 * @param {Object} props
 * @param {Array} props.deliverables - Lista de entregables
 * @param {Function} props.onChange - Callback al cambiar los entregables
 * @param {Object} props.errors - Errores de validación por campo
 * @param {boolean} props.disabled - Si la grilla está deshabilitada
 */
export default function DeliverablesGrid({ deliverables = [], onChange, errors = {}, disabled = false }) {
  const initializedRef = useRef(false);
  
  // Inicializar con un entregable por defecto si está vacío (solo una vez)
  useEffect(() => {
    if (deliverables.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      const defaultDeliverable = {
        title: 'Entregable 1',
        description: '',
        estimatedDeliveryDate: '',
        price: ''
      };
      onChange([defaultDeliverable]);
    }
  }, [deliverables.length]);

  // Agregar nuevo entregable
  const handleAdd = () => {
    const newDeliverable = {
      title: `Entregable ${deliverables.length + 1}`,
      description: '',
      estimatedDeliveryDate: '',
      price: ''
    };
    onChange([...deliverables, newDeliverable]);
  };

  // Eliminar entregable
  const handleRemove = (index) => {
    if (deliverables.length <= 1) return; // Mantener al menos 1
    const updated = deliverables.filter((_, i) => i !== index);
    onChange(updated);
  };

  // Actualizar campo de un entregable específico
  const handleFieldChange = (index, field, value) => {
    const updated = [...deliverables];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Calcular precio total
  const totalPrice = deliverables.reduce((sum, d) => {
    const price = parseFloat(d.price) || 0;
    return sum + price;
  }, 0);

  // Si aún está cargando el primer entregable, mostrar mensaje
  if (deliverables.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        Inicializando entregables...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Entregables</h4>
        <span className="text-sm text-gray-500">
          {deliverables.length} {deliverables.length === 1 ? 'entregable' : 'entregables'}
        </span>
      </div>

      {/* Lista de entregables */}
      <div className="space-y-4">
        {deliverables.map((deliverable, index) => (
          <div
            key={index}
            className="border border-gray-300 rounded-lg p-4 bg-gray-50 relative"
          >
            {/* Botón eliminar (solo si hay más de 1) */}
            {deliverables.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700 disabled:opacity-50"
                title="Eliminar entregable"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="space-y-3 pr-8">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del entregable *
                </label>
                <input
                  type="text"
                  value={deliverable.title}
                  onChange={(e) => handleFieldChange(index, 'title', e.target.value)}
                  placeholder={`Entregable ${index + 1}`}
                  maxLength={100}
                  disabled={disabled}
                  className={`
                    w-full px-3 py-2 border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-conexia-green
                    ${errors[`deliverables[${index}].title`] ? 'border-red-300' : 'border-gray-300'}
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                {errors[`deliverables[${index}].title`] && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors[`deliverables[${index}].title`]}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {deliverable.title?.length || 0}/100 caracteres
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={deliverable.description}
                  onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                  placeholder="Describe qué incluye este entregable"
                  maxLength={500}
                  rows={3}
                  disabled={disabled}
                  className={`
                    w-full px-3 py-2 border rounded-lg resize-none
                    focus:outline-none focus:ring-2 focus:ring-conexia-green
                    ${errors[`deliverables[${index}].description`] ? 'border-red-300' : 'border-gray-300'}
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                  `}
                />
                {errors[`deliverables[${index}].description`] && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors[`deliverables[${index}].description`]}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {deliverable.description?.length || 0}/500 caracteres
                </p>
              </div>

              {/* Fecha y Precio en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Fecha estimada de entrega */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={14} className="inline mr-1" />
                    Fecha estimada de entrega *
                  </label>
                  <input
                    type="date"
                    value={deliverable.estimatedDeliveryDate}
                    onChange={(e) => handleFieldChange(index, 'estimatedDeliveryDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={disabled}
                    className={`
                      w-full px-3 py-2 border rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-conexia-green
                      ${errors[`deliverables[${index}].estimatedDeliveryDate`] ? 'border-red-300' : 'border-gray-300'}
                      ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                    `}
                  />
                  {errors[`deliverables[${index}].estimatedDeliveryDate`] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors[`deliverables[${index}].estimatedDeliveryDate`]}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <DollarSign size={14} className="inline mr-1" />
                    Precio *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={deliverable.price}
                      onChange={(e) => handleFieldChange(index, 'price', e.target.value)}
                      placeholder="0.00"
                      disabled={disabled}
                      className={`
                        w-full pl-8 pr-3 py-2 border rounded-lg
                        focus:outline-none focus:ring-2 focus:ring-conexia-green
                        ${errors[`deliverables[${index}].price`] ? 'border-red-300' : 'border-gray-300'}
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
                      `}
                    />
                  </div>
                  {errors[`deliverables[${index}].price`] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors[`deliverables[${index}].price`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón para agregar más entregables */}
      <Button
        type="button"
        variant="informative"
        onClick={handleAdd}
        disabled={disabled}
        className="w-full"
      >
        <Plus size={18} className="inline mr-2" />
        Agregar otro entregable
      </Button>

      {/* Precio total */}
      <div className="bg-conexia-green bg-opacity-10 rounded-lg p-4 border-2 border-conexia-green">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">Precio total:</span>
          <span className="text-2xl font-bold text-conexia-green">
            ${totalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Suma de todos los entregables
        </p>
      </div>
    </div>
  );
}
