'use client';

import { useState, useEffect } from 'react';
import { useQuotations } from '@/hooks/service-hirings/useQuotations';
import { useQuotationErrorHandler } from '@/hooks/service-hirings/useQuotationErrorHandler';
import { useHiringStatusUpdater } from '@/hooks/service-hirings/useHiringStatusUpdater';
import { X, DollarSign, Clock, FileText, Calendar } from 'lucide-react';
import { getUnitLabel, getTimeUnitOptions } from '@/utils/timeUnit';
import Button from '@/components/ui/Button';
import { getUserDisplayName } from '@/utils/formatUserName';
import PaymentAccountRequiredModal from './PaymentAccountRequiredModal';
import UserBannedModal from './UserBannedModal';

export default function QuotationFormModal({ hiring, isOpen, isEditing = false, onClose, onSuccess, onError, onHiringUpdate }) {
  const { createQuote, updateQuote, loading } = useQuotations();
  const {
    showPaymentAccountModal,
    showUserBannedModal,
    handleQuotationError,
    closePaymentAccountModal,
    closeUserBannedModal
  } = useQuotationErrorHandler();
  const { markAsRejectedDueToBannedUser } = useHiringStatusUpdater();
  
  const [formData, setFormData] = useState({
    quotedPrice: '',
    estimatedHours: '',
    estimatedTimeUnit: '',
    quotationNotes: '',
    quotationValidityDays: ''
  });
  const [errors, setErrors] = useState({});

  // Inicializar formulario cuando cambie el hiring o modo de edición
  useEffect(() => {
    if (hiring) {
      setFormData({
        quotedPrice: isEditing && hiring.quotedPrice ? hiring.quotedPrice.toString() : '',
        estimatedHours: isEditing && hiring.estimatedHours ? hiring.estimatedHours.toString() : '',
        estimatedTimeUnit: isEditing && hiring.estimatedTimeUnit ? hiring.estimatedTimeUnit : '',
        quotationNotes: isEditing && hiring.quotationNotes ? hiring.quotationNotes : '',
        quotationValidityDays: isEditing && hiring.quotationValidityDays ? hiring.quotationValidityDays.toString() : ''
      });
      setErrors({});
    }
  }, [hiring, isEditing, isOpen]);

  if (!isOpen || !hiring) return null;

  const validateForm = () => {
    const newErrors = {};

    // Validar precio
    const price = parseFloat(formData.quotedPrice);
    if (!formData.quotedPrice || isNaN(price) || price <= 0) {
      newErrors.quotedPrice = 'El precio es requerido y debe ser mayor a 0';
    }

    // Validar duración estimada
    const duration = parseInt(formData.estimatedHours);
    if (!formData.estimatedHours || isNaN(duration) || duration < 1) {
      newErrors.estimatedHours = 'La duración estimada es requerida y debe ser al menos 1';
    }

    // Validar unidad de tiempo
    if (!formData.estimatedTimeUnit) {
      newErrors.estimatedTimeUnit = 'La unidad de tiempo es requerida';
    }

    // Validar vigencia
    const validity = parseInt(formData.quotationValidityDays);
    if (!formData.quotationValidityDays || isNaN(validity) || validity < 1) {
      newErrors.quotationValidityDays = 'La vigencia es requerida y debe ser al menos 1 día';
    }

    // Validar notas (opcional pero con límite)
    if (formData.quotationNotes.length > 1000) {
      newErrors.quotationNotes = 'Las notas no pueden exceder 1000 caracteres';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const quotationData = {
        quotedPrice: parseFloat(formData.quotedPrice),
        estimatedHours: parseInt(formData.estimatedHours),
        estimatedTimeUnit: formData.estimatedTimeUnit,
        quotationNotes: formData.quotationNotes.trim() || undefined,
        quotationValidityDays: parseInt(formData.quotationValidityDays)
      };

      if (isEditing) {
        await updateQuote(hiring.id, quotationData);
        onSuccess?.('Cotización actualizada exitosamente');
      } else {
        await createQuote(hiring.id, quotationData);
        onSuccess?.('Cotización creada exitosamente');
      }

      onClose();
    } catch (error) {
      // Intentar manejar errores específicos primero
      const wasHandled = handleQuotationError(error);
      
      // Si no se manejó como error específico, mostrar error genérico
      if (!wasHandled) {
        onError?.(error.message || 'Error al procesar la cotización');
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Editar Cotización' : 'Crear Cotización'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Información de la solicitud */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Información de la Solicitud</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <span className="ml-2 font-medium">
                    {hiring.clientName || getUserDisplayName({ name: hiring.name, lastName: hiring.lastName })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fecha:</span>
                  <span className="ml-2 font-medium">{formatDate(hiring.createdAt)}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Descripción:</span>
                  <p className="mt-1 p-3 bg-white rounded border text-gray-900">
                    {hiring.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario de cotización */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Detalles de la Cotización</h4>
              
              {/* Precio */}
              <div>
                <label htmlFor="quotedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign size={16} className="inline mr-1" />
                  Precio Final *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="quotedPrice"
                    step="0.01"
                    min="0"
                    value={formData.quotedPrice}
                    onChange={(e) => handleInputChange('quotedPrice', e.target.value)}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                      errors.quotedPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    disabled={loading}
                  />
                </div>
                {errors.quotedPrice && (
                  <p className="text-sm text-red-600 mt-1">{errors.quotedPrice}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Precio base: ${hiring.service?.price?.toLocaleString()}{hiring.service?.timeUnit ? ` por ${getUnitLabel(hiring.service.timeUnit)}` : ''}
                </p>
              </div>

              {/* Duración estimada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Duración aprox. del servicio *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      id="estimatedHours"
                      min="1"
                      value={formData.estimatedHours}
                      onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                        errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="1"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <select
                      id="estimatedTimeUnit"
                      value={formData.estimatedTimeUnit}
                      onChange={(e) => handleInputChange('estimatedTimeUnit', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                        errors.estimatedTimeUnit ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={loading}
                    >
                      <option value="">Seleccionar unidad</option>
                      {getTimeUnitOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(errors.estimatedHours || errors.estimatedTimeUnit) && (
                  <div className="mt-1">
                    {errors.estimatedHours && (
                      <p className="text-sm text-red-600">{errors.estimatedHours}</p>
                    )}
                    {errors.estimatedTimeUnit && (
                      <p className="text-sm text-red-600">{errors.estimatedTimeUnit}</p>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Tiempo aproximado que te tomará completar el trabajo
                </p>
              </div>

              {/* Vigencia de la cotización */}
              <div>
                <label htmlFor="quotationValidityDays" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Vigencia de la cotización (días) *
                </label>
                <input
                  type="number"
                  id="quotationValidityDays"
                  min="1"
                  value={formData.quotationValidityDays}
                  onChange={(e) => handleInputChange('quotationValidityDays', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green ${
                    errors.quotationValidityDays ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: 7"
                  disabled={loading}
                />
                {errors.quotationValidityDays && (
                  <p className="text-sm text-red-600 mt-1">{errors.quotationValidityDays}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  La cotización será válida por este número de días
                </p>
              </div>

              {/* Notas adicionales */}
              <div>
                <label htmlFor="quotationNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Notas Adicionales
                </label>
                <textarea
                  id="quotationNotes"
                  rows={4}
                  value={formData.quotationNotes}
                  onChange={(e) => handleInputChange('quotationNotes', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green resize-none ${
                    errors.quotationNotes ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Incluye detalles adicionales sobre el trabajo, materiales, condiciones, etc..."
                  disabled={loading}
                />
                {errors.quotationNotes && (
                  <p className="text-sm text-red-600 mt-1">{errors.quotationNotes}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Opcional - Máximo 1000 caracteres ({formData.quotationNotes.length}/1000)
                </p>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">💡 Consejos para una buena cotización</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sé específico sobre qué incluye el precio</li>
                <li>• Menciona si hay costos adicionales no incluidos</li>
                <li>• Establece un tiempo realista para completar el trabajo</li>
                <li>• Incluye información sobre garantías o revisiones</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading 
                ? 'Procesando...' 
                : isEditing 
                  ? 'Actualizar Cotización' 
                  : 'Enviar Cotización'
              }
            </Button>
          </div>
        </form>
      </div>

      {/* Modales de error específicos */}
      <PaymentAccountRequiredModal
        isOpen={showPaymentAccountModal}
        onClose={() => {
          closePaymentAccountModal();
          // Cerrar también el modal principal cuando se cancela
          onClose();
        }}
      />

      <UserBannedModal
        isOpen={showUserBannedModal}
        onClose={closeUserBannedModal}
        onAccept={() => {
          // Actualizar el estado de la solicitud como rechazada
          if (hiring && onHiringUpdate) {
            markAsRejectedDueToBannedUser(hiring.id, onHiringUpdate);
          }
          onSuccess?.('La solicitud ha sido rechazada automáticamente');
          // Cerrar el modal principal de cotización
          onClose();
        }}
      />
    </div>
  );
}