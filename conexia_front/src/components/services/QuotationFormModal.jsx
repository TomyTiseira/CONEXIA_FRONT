'use client';

import { useState, useEffect } from 'react';
import { useQuotations } from '@/hooks/service-hirings/useQuotations';
import { useQuotationErrorHandler } from '@/hooks/service-hirings/useQuotationErrorHandler';
import { useHiringStatusUpdater } from '@/hooks/service-hirings/useHiringStatusUpdater';
import { X, DollarSign, Clock, FileText, Calendar, Briefcase, User } from 'lucide-react';
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
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header fijo */}
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-conexia-green flex items-center gap-2">
              {isEditing ? (
                <>
                  Editar Cotización
                </>
              ) : (
                <>
                  Crear Cotización
                </>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Contenido scrolleable: incluye servicio, solicitud y formulario */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 min-h-0">
              {/* Información del servicio */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-conexia-green mb-2 flex items-center gap-2">
                  <Briefcase size={18} className="text-conexia-green" />
                  Mi Servicio
                </h4>
                <p className="text-sm font-medium text-gray-900 mb-1 break-words">
                  {hiring.service?.title}
                </p>
                <p className="text-xs text-gray-600">
                  Precio base: ${hiring.service?.price?.toLocaleString()} {hiring.service?.currency}
                </p>
              </div>
              {/* Solicitud del cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Lo que solicita el cliente
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  Cliente: {getUserDisplayName(hiring.user)} • {formatDate(hiring.createdAt)}
                </p>
                <div className="text-sm text-gray-900 bg-white p-3 rounded border break-words overflow-wrap-anywhere">
                  {hiring.description || 'Sin descripción específica'}
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
            {/* Footer fijo */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0">
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="cancel"
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
            </div>
          </form>
        </div>
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